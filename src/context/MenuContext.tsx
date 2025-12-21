import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HomeIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  CommandLineIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  SignalIcon,
  PencilSquareIcon,
  BellIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export interface MenuItem {
  id: string;
  name: string;
  href: string;
  iconName: string; // Store icon name as string for persistence
  visible: boolean;
  order: number;
  required?: boolean; // If true, cannot be hidden (e.g., Dashboard)
}

interface MenuContextType {
  menuItems: MenuItem[];
  toggleVisibility: (id: string) => void;
  moveItem: (id: string, direction: 'up' | 'down') => void;
  reorderItems: (newOrder: MenuItem[]) => void;
  resetMenu: () => void;
  getIconComponent: (iconName: string) => any;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Map of icon names to components
const iconMap: Record<string, any> = {
  HomeIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  CommandLineIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  SignalIcon,
  PencilSquareIcon,
  BellIcon,
  AcademicCapIcon,
};

const defaultMenuItems: MenuItem[] = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', iconName: 'HomeIcon', visible: true, order: 0, required: true },
  { id: 'monitoring', name: 'Monitoreo', href: '/monitoring', iconName: 'SignalIcon', visible: true, order: 1 },
  { id: 'notes', name: 'Notas', href: '/notes', iconName: 'PencilSquareIcon', visible: true, order: 2 },
  { id: 'reminders', name: 'Recordatorios', href: '/reminders', iconName: 'BellIcon', visible: true, order: 3 },
  { id: 'knowledge', name: 'Aprendizaje', href: '/knowledge', iconName: 'AcademicCapIcon', visible: true, order: 4 },
  { id: 'incidents', name: 'Incidentes', href: '/incidents', iconName: 'ExclamationTriangleIcon', visible: true, order: 5 },
  { id: 'servers', name: 'Servidores', href: '/servers', iconName: 'ServerIcon', visible: true, order: 6 },
  { id: 'solutions', name: 'Soluciones', href: '/solutions', iconName: 'BookOpenIcon', visible: true, order: 7 },
  { id: 'scripts', name: 'Scripts', href: '/scripts', iconName: 'CommandLineIcon', visible: true, order: 8 },
  { id: 'reports', name: 'Reportes', href: '/reports', iconName: 'DocumentTextIcon', visible: true, order: 9 },
  { id: 'search', name: 'Búsqueda', href: '/search', iconName: 'MagnifyingGlassIcon', visible: true, order: 10 },
  { id: 'settings', name: 'Configuración', href: '/settings', iconName: 'Cog6ToothIcon', visible: true, order: 11, required: true }, // Settings should probably also be required or at least handled carefully
  { id: 'audit', name: 'Auditoría', href: '/audit', iconName: 'ShieldCheckIcon', visible: true, order: 12 }, // Admin only, handled in component
];

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('menu_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default to ensure new items appear if added in updates
        // This is a simple merge: if ID exists in saved, use saved state (visibility/order), else use default
        // But we also need to handle if default items changed.
        // For simplicity, let's just use saved, but maybe check if we are missing any keys from default
        
        // Better approach: Use default items, but override visibility and order from saved
        return defaultMenuItems.map(defItem => {
          const savedItem = parsed.find((p: MenuItem) => p.id === defItem.id);
          if (savedItem) {
            return { ...defItem, visible: savedItem.visible, order: savedItem.order };
          }
          return defItem;
        }).sort((a, b) => a.order - b.order);

      } catch (e) {
        console.error('Failed to parse menu config', e);
        return defaultMenuItems;
      }
    }
    return defaultMenuItems;
  });

  useEffect(() => {
    localStorage.setItem('menu_config', JSON.stringify(menuItems));
  }, [menuItems]);

  const toggleVisibility = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id && !item.required) {
        return { ...item, visible: !item.visible };
      }
      return item;
    }));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setMenuItems(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      const newItems = [...prev];
      if (direction === 'up' && index > 0) {
        // Swap with previous
        [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        // Update order property
        newItems.forEach((item, idx) => item.order = idx);
      } else if (direction === 'down' && index < newItems.length - 1) {
        // Swap with next
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        // Update order property
        newItems.forEach((item, idx) => item.order = idx);
      }
      return newItems;
    });
  };

  const reorderItems = (newOrder: MenuItem[]) => {
    const updatedItems = newOrder.map((item, index) => ({ ...item, order: index }));
    setMenuItems(updatedItems);
  };

  const resetMenu = () => {
    setMenuItems(defaultMenuItems);
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || HomeIcon;
  };

  return (
    <MenuContext.Provider value={{ menuItems, toggleVisibility, moveItem, reorderItems, resetMenu, getIconComponent }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
