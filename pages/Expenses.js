import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const Expenses = () => {
  const { theme } = useTheme();
  // Get global state
  const { state } = useAppContext();
  const { transactionHistory, cards } = state;

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get all subtraction transactions (expenses) from all cards
  const getAllExpenses = () => {
    return transactionHistory.filter(transaction => 
      transaction.operation === 'subtract'
    );
  };

  // Get expenses grouped by category
  const getExpensesByCategory = () => {
    const expenses = getAllExpenses();
    const categoryMap = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          total: 0,
          transactions: []
        };
      }
      categoryMap[category].total += expense.amount;
      categoryMap[category].transactions.push(expense);
    });
    
    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
  };

  // Get expenses grouped by card
  const getExpensesByCard = () => {
    const expenses = getAllExpenses();
    const cardMap = {};
    
    expenses.forEach(expense => {
      const cardId = expense.cardId || 'General';
      const cardName = expense.cardName || 'General Expenses';
      
      if (!cardMap[cardId]) {
        cardMap[cardId] = {
          cardId,
          cardName,
          total: 0,
          transactions: []
        };
      }
      cardMap[cardId].total += expense.amount;
      cardMap[cardId].transactions.push(expense);
    });
    
    return Object.values(cardMap).sort((a, b) => b.total - a.total);
  };

  // Get total expenses
  const getTotalExpenses = () => {
    return getAllExpenses().reduce((total, expense) => total + expense.amount, 0);
  };

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Dining': '🍽️',
      'Shopping': '🛍️',
      'Groceries': '🛒',
      'Food': '🍔',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Bills': '📄',
      'Healthcare': '🏥',
      'Other': '📦',
      'Uncategorized': '📋'
    };
    return iconMap[category] || '📋';
  };

  const allExpenses = getAllExpenses();
  const expensesByCategory = getExpensesByCategory();
  const expensesByCard = getExpensesByCard();
  const totalExpenses = getTotalExpenses();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Expenses Information</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Spendings across all cards</Text>
      </View>

      {/* Total Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Total Expenses</Text>
        <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>{formatCurrency(totalExpenses)}</Text>
        <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>{allExpenses.length} transactions</Text>
      </View>

      {/* Expenses by Category */}
      {expensesByCategory.length > 0 && (
        <View style={styles.section}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>By Category</Text>
            {expensesByCategory.map((categoryData, index) => (
              <View key={index} style={[styles.categoryCard, { backgroundColor: '#FFFFFF' }]}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(categoryData.category)}</Text>
                    <Text style={[styles.categoryName, { color: '#000000' }]}>{categoryData.category}</Text>
                  </View>
                  <Text style={[styles.categoryTotal, { color: '#DC2626' }]}>{formatCurrency(categoryData.total)}</Text>
                </View>
                <Text style={[styles.transactionCount, { color: '#666666' }]}>{categoryData.transactions.length} transactions</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
      )}

      {/* Expenses by Card */}
      {expensesByCard.length > 0 && (
        <View style={styles.section}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>By Card</Text>
            {expensesByCard.map((cardData, index) => (
              <View key={index} style={[styles.cardCard, { backgroundColor: '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardIcon}>💳</Text>
                    <Text style={[styles.cardName, { color: '#000000' }]}>{cardData.cardName}</Text>
                  </View>
                  <Text style={[styles.cardTotal, { color: '#DC2626' }]}>{formatCurrency(cardData.total)}</Text>
                </View>
                <Text style={[styles.transactionCount, { color: '#666666' }]}>{cardData.transactions.length} transactions</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionGradient}
        >
          <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Recent Transactions</Text>
          {allExpenses.length === 0 ? (
            <Text style={[styles.emptyText, { color: '#FFFFFF' }]}>No expenses recorded yet</Text>
          ) : (
            allExpenses.slice(0, 10).map((expense) => (
              <View key={expense.id} style={[styles.transactionItem, { backgroundColor: '#FFFFFF' }]}>
                <View style={styles.transactionInfo}>
                  <View style={styles.transactionIcon}>
                    <Text style={styles.transactionIconText}>
                      {expense.category ? getCategoryIcon(expense.category) : '○'}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionDescription, { color: '#000000' }]}>{expense.description}</Text>
                    <Text style={[styles.transactionMeta, { color: '#666666' }]}>
                      {expense.cardName}
                    </Text>
                    <Text style={[styles.transactionMeta, { color: '#666666' }]}>
                      {expense.date}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: '#DC2626' }]}>-{formatCurrency(expense.amount)}</Text>
              </View>
            ))
          )}
        </LinearGradient>
      </View>
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
  summaryCard: {
    margin: 20,
    backgroundColor: '#E0E0E0',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  section: {
    margin: 20,
    borderRadius: 20,
  },
  sectionGradient: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  categoryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  transactionCount: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  cardCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  cardTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  transactionMeta: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default Expenses;
