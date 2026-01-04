import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

type UpdateState = 'idle' | 'available' | 'downloading' | 'downloaded' | 'installing' | 'error';

export default function UpdateNotification() {
  const { addSystemNotification } = useNotifications();
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Listen for update events from Electron
    if (window.electron) {
      const offUpdateAvailable = window.electron.on('update-available', (info: UpdateInfo) => {
        setUpdateState('available');
        setUpdateInfo(info);
        
        // Add subtle notification to the bell
        addSystemNotification({
          title: 'Actualización Disponible',
          message: `Nueva versión ${info.version} lista para descargar.`,
          type: 'system_update',
          priority: 'medium'
        });
      });

      const offDownloadProgress = window.electron.on('download-progress', (progress: DownloadProgress) => {
        setUpdateState('downloading');
        setDownloadProgress(progress);
      });

      const offUpdateDownloaded = window.electron.on('update-downloaded', (info: UpdateInfo) => {
        setUpdateState('downloaded');
        setUpdateInfo(info);
        
        addSystemNotification({
          title: 'Actualización Lista',
          message: `Versión ${info.version} descargada. Haz clic para instalar.`,
          type: 'success',
          priority: 'high'
        });
      });
      
      const offUpdateError = window.electron.on('update-error', (err: any) => {
        setUpdateState('error');
        setErrorMessage(String(err?.message || err || 'Error desconocido'));
        
        addSystemNotification({
          title: 'Error de actualización',
          message: String(err?.message || err || 'Error desconocido'),
          type: 'error',
          priority: 'high'
        });
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
          setUpdateState('idle');
        }, 10000);
      });

      return () => {
        try {
          if (typeof offUpdateAvailable === 'function') offUpdateAvailable();
          if (typeof offDownloadProgress === 'function') offDownloadProgress();
          if (typeof offUpdateDownloaded === 'function') offUpdateDownloaded();
          if (typeof offUpdateError === 'function') offUpdateError();
        } catch (e) {
          window.electron?.removeAllListeners?.('update-available');
          window.electron?.removeAllListeners?.('download-progress');
          window.electron?.removeAllListeners?.('update-downloaded');
          window.electron?.removeAllListeners?.('update-error');
        }
      };
    }
  }, [addSystemNotification]);

  const handleDownload = async () => {
    setUpdateState('downloading');
    try {
      await window.electron.invoke('download-update');
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateState('error');
      setErrorMessage('Error al descargar la actualización');
    }
  };

  const handleInstall = async () => {
    setUpdateState('installing');
    try {
      await window.electron.invoke('install-update');
      // App will restart automatically
    } catch (error) {
      console.error('Error installing update:', error);
      setUpdateState('error');
      setErrorMessage('Error al instalar la actualización');
    }
  };

  const handleDismiss = () => {
    setUpdateState('idle');
    setUpdateInfo(null);
    setDownloadProgress(null);
    setErrorMessage('');
  };

  // Don't render anything if idle
  if (updateState === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
        
        {/* Update Available */}
        {updateState === 'available' && (
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Actualización Disponible
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Versión {updateInfo?.version} está disponible
                </p>
                {updateInfo?.releaseDate && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Fecha: {new Date(updateInfo.releaseDate).toLocaleDateString('es-ES')}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                  >
                    Más tarde
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Downloading */}
        {updateState === 'downloading' && downloadProgress && (
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-500 animate-bounce" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Descargando actualización
                </h3>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress.percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{downloadProgress.percent.toFixed(1)}%</span>
                    <span>
                      {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB de{' '}
                    {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Downloaded - Ready to Install */}
        {updateState === 'downloaded' && (
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Actualización Lista
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Versión {updateInfo?.version} descargada correctamente
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  La aplicación se reiniciará automáticamente
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Instalar y Reiniciar
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                  >
                    Más tarde
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Installing */}
        {updateState === 'installing' && (
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-6 w-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Instalando actualización
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  La aplicación se reiniciará en unos momentos...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {updateState === 'error' && (
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Error de actualización
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {errorMessage}
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
