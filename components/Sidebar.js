import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faMinus, faPlus, faFolder, faChartBar, faCog } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ navigation, currentPage, onNavigate }) => {
  const { theme } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: faHome },
    { id: 'expenses', title: 'Expenses', icon: faMinus },
    { id: 'income', title: 'Income', icon: faPlus },
    { id: 'categories', title: 'Categories', icon: faFolder },
    { id: 'reports', title: 'Reports', icon: faChartBar },
    { id: 'settings', title: 'Settings', icon: faCog },
  ];

  return (
    <TouchableOpacity 
      style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}
      activeOpacity={1}
      onPress={(e) => e.stopPropagation()}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.logo, { color: theme.colors.text }]}>eWallet</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Digital Banking</Text>
      </View>
      
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem, 
              { borderBottomColor: theme.colors.border },
              currentPage === item.id && { backgroundColor: '#FFFFFF' }
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <FontAwesomeIcon 
              icon={item.icon} 
              size={20} 
              color={currentPage === item.id ? '#000000' : theme.colors.textSecondary}
              style={styles.menuIcon}
            />
            <Text style={[
              styles.menuText, 
              { color: theme.colors.text },
              currentPage === item.id && { color: '#000000', fontWeight: 'bold' }
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100%',
    paddingTop: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
    marginTop: 4,
  },
  menu: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

export default Sidebar;
