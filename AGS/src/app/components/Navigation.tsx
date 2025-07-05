'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Avatar,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Divider,
  User
} from '@heroui/react';
import { 
  Home, 
  FileText, 
  History, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  LogOut,
  Leaf,
  User2
} from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Documents', href: '/documents', icon: BookOpen },
    { name: 'History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      maxWidth="full"
      height="4rem"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Button
            variant="light"
            className="p-0 h-auto min-w-0"
            onPress={() => handleNavigation('/')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-gray-900">Oil Palm AI</p>
                <p className="text-xs text-gray-500">Assistant</p>
              </div>
            </div>
          </Button>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <NavbarItem key={item.name} isActive={active}>
              <Button
                variant={active ? "solid" : "light"}
                color={active ? "primary" : "default"}
                className="flex items-center gap-2 px-3 py-2 h-auto min-w-0"
                onPress={() => handleNavigation(item.href)}
                startContent={<Icon className="w-4 h-4" />}
              >
                {item.name}
              </Button>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="light"
                className="p-1 h-auto min-w-0"
              >
                <User
                  name={user.displayName || 'User'}
                  description={user.email}
                  avatarProps={{
                    src: user.photoURL || '',
                    showFallback: true,
                    name: user.displayName || user.email || 'U',
                    size: "sm"
                  }}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem 
                key="profile" 
                className="h-14 gap-2"
                textValue="Profile"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="settings" 
                startContent={<Settings className="w-4 h-4" />}
                onPress={() => handleNavigation('/settings')}
              >
                Settings
              </DropdownItem>
              <DropdownItem 
                key="profile-page" 
                startContent={<User2 className="w-4 h-4" />}
                onPress={() => handleNavigation('/profile')}
              >
                My Profile
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                startContent={<LogOut className="w-4 h-4" />}
                onPress={handleSignOut}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="light"
              color="primary"
              onPress={() => handleNavigation('/login')}
            >
              Sign In
            </Button>
            <Button
              color="primary"
              onPress={() => handleNavigation('/register')}
            >
              Sign Up
            </Button>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu>
        <div className="flex flex-col gap-2 mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <NavbarMenuItem key={item.name}>
                <Button
                  variant={active ? "solid" : "light"}
                  color={active ? "primary" : "default"}
                  className="w-full justify-start flex items-center gap-3 py-2"
                  onPress={() => handleNavigation(item.href)}
                  startContent={<Icon className="w-5 h-5" />}
                >
                  {item.name}
                </Button>
              </NavbarMenuItem>
            );
          })}
          
          <Divider className="my-4" />
          
          {user ? (
            <>
              <NavbarMenuItem>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  onPress={() => handleNavigation('/profile')}
                  startContent={<User2 className="w-5 h-5" />}
                >
                  My Profile
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  onPress={() => handleNavigation('/settings')}
                  startContent={<Settings className="w-5 h-5" />}
                >
                  Settings
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  color="danger"
                  variant="light"
                  className="w-full justify-start"
                  onPress={handleSignOut}
                  startContent={<LogOut className="w-5 h-5" />}
                >
                  Sign Out
                </Button>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <Button
                  variant="light"
                  color="primary"
                  className="w-full justify-start"
                  onPress={() => handleNavigation('/login')}
                >
                  Sign In
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  color="primary"
                  className="w-full justify-start"
                  onPress={() => handleNavigation('/register')}
                >
                  Sign Up
                </Button>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
