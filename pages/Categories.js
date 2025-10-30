import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const Categories = () => {
  const { theme } = useTheme();
  // Get global state and actions
  const { state, actions } = useAppContext();
  const { categories } = state;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'subtract'
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📋'
  });

  // Use global state categories
  const addCategories = categories.addFundCategories;
  const subtractCategories = categories.subtractFundCategories;

  // Icon options for categories
  const iconOptions = [
    '💰', '🔄', '🎁', '🍽️', '🛍️', '🛒', '💼', '📈', '🏢', '🏠', 
    '🎉', '📦', '📋', '🍔', '🚗', '🎬', '📄', '🏥', '🎯', '⭐'
  ];

  // Get current categories based on type
  const getCurrentCategories = () => {
    return modalType === 'add' ? addCategories : subtractCategories;
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    const existingCategories = getCurrentCategories();
    if (existingCategories.includes(newCategory.name.trim())) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    // Add the new category to the global state
    const trimmedName = newCategory.name.trim();
    const categoryType = modalType === 'add' ? 'addFundCategories' : 'subtractFundCategories';
    actions.addCategory(categoryType, trimmedName);
    
    setNewCategory({ name: '', icon: '📋' });
    setShowAddModal(false);
  };

  const editCategory = () => {
    if (!newCategory.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const trimmedName = newCategory.name.trim();
    const categoryType = modalType === 'add' ? 'addFundCategories' : 'subtractFundCategories';
    
    // Update the category in the global state
    actions.updateCategory(categoryType, editingCategory, trimmedName);
    
    setNewCategory({ name: '', icon: '📋' });
    setEditingCategory(null);
    setShowEditModal(false);
  };

  const deleteCategory = (categoryName, type) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Remove the category from the global state
            const categoryType = type === 'add' ? 'addFundCategories' : 'subtractFundCategories';
            actions.deleteCategory(categoryType, categoryName);
          }
        }
      ]
    );
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const openEditModal = (categoryName, type) => {
    setModalType(type);
    setEditingCategory(categoryName);
    setNewCategory({ name: categoryName, icon: '📋' });
    setShowEditModal(true);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Salary': '💰', 'Transfer': '🔄', 'Allowance': '🎁',
      'Dining': '🍽️', 'Shopping': '🛍️', 'Groceries': '🛒'
    };
    return iconMap[category] || '📋';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Fund Categories</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage categories for adding/subtracting funds</Text>
      </View>

      {/* Add Fund Categories */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionGradient}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Add Funds</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openAddModal('add')}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {addCategories.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => openEditModal(category, 'add')}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteCategory(category, 'add')}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Subtract Fund Categories */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionGradient}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Subtract Funds</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openAddModal('subtract')}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {subtractCategories.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => openEditModal(category, 'subtract')}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteCategory(category, 'subtract')}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>
              Add New {modalType === 'add' ? 'Add Fund' : 'Subtract Fund'} Category
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#FFFFFF"
              value={newCategory.name}
              onChangeText={(text) => setNewCategory({...newCategory, name: text})}
            />
            
            <View style={styles.iconSelector}>
              <Text style={styles.selectorLabel}>Choose Icon:</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, newCategory.icon === icon && styles.selectedIcon]}
                    onPress={() => setNewCategory({...newCategory, icon})}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addCategory}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>
              Edit {modalType === 'add' ? 'Add Fund' : 'Subtract Fund'} Category
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#FFFFFF"
              value={newCategory.name}
              onChangeText={(text) => setNewCategory({...newCategory, name: text})}
            />
            
            <View style={styles.iconSelector}>
              <Text style={styles.selectorLabel}>Choose Icon:</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, newCategory.icon === icon && styles.selectedIcon]}
                    onPress={() => setNewCategory({...newCategory, icon})}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={editCategory}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 5,
  },
  section: {
    margin: 20,
    borderRadius: 20,
  },
  sectionGradient: {
    padding: 24,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    minHeight: 60,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  categoryName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editButtonText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 32,
    paddingBottom: 40,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    minHeight: 500,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontWeight: '400',
  },
  iconSelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    backgroundColor: '#2A2A2A',
  },
  iconText: {
    fontSize: 20,
  },  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginLeft: 6,
  },
  saveButtonText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Categories;
