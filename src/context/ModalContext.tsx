import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  isOpen: boolean;
  modalOptions: ModalOptions | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions({
      type: 'info',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      ...options,
    });
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    // Delay clearing options to allow animation to finish
    setTimeout(() => {
      setModalOptions(null);
    }, 300);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, isOpen, modalOptions }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
