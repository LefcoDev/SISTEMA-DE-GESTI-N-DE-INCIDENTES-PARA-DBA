import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { useNotifications } from '../hooks/useNotifications';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export default function UpdateNotification() {
  const { showModal } = useModal();
  const { addSystemNotification } = useNotifications();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  useEffect(() => {
    // Listen for update events from Electron
    if (window.electron) {
      const offUpdateAvailable = window.electron.on('update-available', (info: UpdateInfo) => {
        // Add notification to the bell
        addSystemNotification({
          title: 'Actualización Disponible',
          message: `Nueva versión ${info.version} disponible.`,
          type: 'system_update',
          priority: 'high',
          action_url: '#', // Or trigger download
          onAction: () => {
             setDownloading(true);
             window.electron.invoke('download-update');
          }
        });

        // Show modal
        showModal({
          title: 'Actualización Disponible',
          message: `Nueva versión ${info.version} disponible. ¿Desea descargarla ahora?`,
          type: 'confirm',
          confirmText: 'Descargar',
          cancelText: 'Más tarde',
          onConfirm: () => {
            setDownloading(true);
            window.electron.invoke('download-update');
          }
        });
      });

      const offDownloadProgress = window.electron.on('download-progress', (progress: DownloadProgress) => {
        setDownloadProgress(progress);
      });

      const offUpdateDownloaded = window.electron.on('update-downloaded', (info: UpdateInfo) => {
        setDownloading(false);
        showModal({
          title: 'Actualización Lista',
          message: `La versión ${info.version} se ha descargado correctamente. ¿Desea reiniciar la aplicación ahora para instalarla?`,
          type: 'success',
          confirmText: 'Reiniciar Ahora',
          cancelText: 'Más tarde',
          onConfirm: () => {
            window.electron.invoke('install-update');
          }
        });
      });
      const offUpdateError = window.electron.on('update-error', (err: any) => {
        setDownloading(false);
        addSystemNotification({
          title: 'Error de actualización',
          message: String(err?.message || err || 'Error desconocido'),
          type: 'error',
          priority: 'high'
        });
      });
    }

    // Cleanup
    return () => {
      try {
        if (typeof offUpdateAvailable === 'function') offUpdateAvailable();
        if (typeof offDownloadProgress === 'function') offDownloadProgress();
        if (typeof offUpdateDownloaded === 'function') offUpdateDownloaded();
        if (typeof offUpdateError === 'function') offUpdateError();
      } catch (e) {
        // Fallback removal
        window.electron?.removeAllListeners?.('update-available');
        window.electron?.removeAllListeners?.('download-progress');
        window.electron?.removeAllListeners?.('update-downloaded');
        window.electron?.removeAllListeners?.('update-error');
      }
    };
  }, [showModal]);



  if (downloading && downloadProgress) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ArrowDownTrayIcon className="h-6 w-6 text-indigo-600 animate-bounce" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Descargando actualización
              </h3>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {downloadProgress.percent.toFixed(1)}% - {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
