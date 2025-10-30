import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Dimensions, FlatList, Animated, Platform, Share, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const { width: screenWidth } = Dimensions.get('window');
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Get global state and actions
  const { state, actions } = useAppContext();
  const { cards, transactionHistory, categories } = state;
  const { deleteTransactionHistory } = actions;
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [showCardOptionsModal, setShowCardOptionsModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showFundAmountModal, setShowFundAmountModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundOperation, setFundOperation] = useState(''); // 'add' or 'subtract'
  const [transactionName, setTransactionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editCardData, setEditCardData] = useState({
    name: '',
    type: 'debit',
    balance: 0,
    creditLimit: 0,
    paymentDate: ''
  });
  const [newCard, setNewCard] = useState({
    name: '',
    type: 'debit',
    balance: 0,
    creditLimit: 0,
    paymentDate: ''
  });
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Category definitions - now using global state
  const addFundCategories = categories.addFundCategories;
  const subtractFundCategories = categories.subtractFundCategories;
  
  // Get current categories based on operation
  const getCurrentCategories = () => {
    return fundOperation === 'add' ? addFundCategories : subtractFundCategories;
  };

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Salary': '💰',
      'Transfer': '🔄',
      'Allowance': '🎁',
      'Dining': '🍽️',
      'Shopping': '🛍️',
      'Groceries': '🛒'
    };
    return iconMap[category] || '';
  };

  // Get transactions for the currently selected card
  const getCurrentCardTransactions = () => {
    if (currentCardIndex >= cards.length) {
      return []; // No card selected (add card button)
    }
    
    const currentCard = cards[currentCardIndex];
    if (!currentCard) {
      return [];
    }

    // Filter transactions that belong to the current card
    return transactionHistory.filter(transaction => {
      // For card fund operations, check if the transaction belongs to this card
      if (transaction.type === 'card_fund' && transaction.cardId === currentCard.id) {
        return true;
      }
      
      // For expenses and income, we could show them for all cards since they're general financial activity
      // Or we could associate them with specific cards. For now, let's show them for all cards
      // but you can modify this logic based on your requirements
      return false;
    });
  };

  const currentCardTransactions = getCurrentCardTransactions();

  // Card dimensions
  const CARD_WIDTH = screenWidth * 0.85;
  const CARD_SPACING = 20;
  const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_SPACING;

  // Handle scroll events with smooth animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEndDrag = () => {
    setIsUserScrolling(false);
  };

  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / CARD_TOTAL_WIDTH);
    const clampedIndex = Math.min(Math.max(newIndex, 0), cards.length);
    
    // Calculate the target position for snapping
    const targetX = clampedIndex * CARD_TOTAL_WIDTH;
    const currentX = contentOffsetX;
    
    // Only snap if we're not already close to the target position
    // This prevents conflicts with manual scrolling
    const snapThreshold = 20; // pixels
    if (Math.abs(currentX - targetX) > snapThreshold) {
      // Smooth snap to the nearest card
      scrollViewRef.current?.scrollTo({ 
        x: targetX, 
        animated: true 
      });
    }
    
    setCurrentCardIndex(clampedIndex);
  };

  // Scroll to specific card
  const scrollToCard = (index) => {
    if (scrollViewRef.current) {
      const targetX = index * CARD_TOTAL_WIDTH;
      scrollViewRef.current.scrollTo({ 
        x: targetX, 
        animated: true 
      });
      setCurrentCardIndex(index);
    }
  };

  // Card management functions
  const addNewCard = () => {
    if (!newCard.name.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }
    
    const card = {
      id: Date.now().toString(),
      name: newCard.name,
      type: newCard.type,
      expiryDate: '12/28',
      ...(newCard.type === 'debit' 
        ? { balance: newCard.balance || 0 }
        : { 
            creditLimit: newCard.creditLimit || 5000,
            currentSpending: 0,
            paymentDate: newCard.paymentDate || '1st of each month'
          }
      )
    };
    
    actions.addCard(card);
    setNewCard({ name: '', type: 'debit', balance: 0, creditLimit: 0, paymentDate: '' });
    setShowAddCardModal(false);
  };

  const handleAddCardPress = () => {
    setShowAddCardModal(true);
  };

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setShowCardOptionsModal(true);
  };

  const handleManageFunds = () => {
    setShowCardOptionsModal(false);
    setShowFundModal(true);
  };

  const handleEditCard = () => {
    if (selectedCard) {
      setEditCardData({
        name: selectedCard.name,
        type: selectedCard.type,
        balance: selectedCard.balance || 0,
        creditLimit: selectedCard.creditLimit || 0,
        paymentDate: selectedCard.paymentDate || ''
      });
      setShowCardOptionsModal(false);
      setShowEditCardModal(true);
    }
  };

  const handleDeleteCard = () => {
    setCardToDelete(selectedCard);
    setShowCardOptionsModal(false);
    setShowDeleteCardModal(true);
  };

  const processFundOperation = () => {
    if (!selectedCard || !fundAmount) return;
    
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Create transaction history entry
    const transaction = {
      id: Date.now(),
      type: 'card_fund',
      operation: fundOperation, // 'add' or 'subtract'
      amount: amount,
      description: transactionName.trim() || `${fundOperation === 'add' ? 'Added' : 'Subtracted'} ${formatCurrency(amount)} to ${selectedCard.name}`,
      date: new Date().toLocaleDateString(),
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      category: selectedCategory || ''
    };

    if (selectedCard.type === 'debit') {
      const newBalance = fundOperation === 'add' 
        ? selectedCard.balance + amount 
        : Math.max(0, selectedCard.balance - amount);
      actions.updateCardBalance(selectedCard.id, newBalance);
    } else {
      const newSpending = fundOperation === 'add' 
        ? (selectedCard.currentSpending || 0) + amount 
        : Math.max(0, (selectedCard.currentSpending || 0) - amount);
      actions.updateCard({ 
        id: selectedCard.id, 
        currentSpending: newSpending 
      });
    }

    // Add transaction to history
    actions.addTransactionHistory(transaction);

    setShowFundModal(false);
    setShowFundAmountModal(false);
    setFundAmount('');
    setTransactionName('');
    setSelectedCategory('');
    setSelectedCard(null);
  };

  const cancelFundOperation = () => {
    setShowFundModal(false);
    setFundAmount('');
    setTransactionName('');
    setSelectedCategory('');
    setSelectedCard(null);
  };

  const saveEditCard = () => {
    if (!editCardData.name.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    const updatedCard = {
      id: selectedCard.id,
      name: editCardData.name,
      type: editCardData.type,
      ...(editCardData.type === 'debit' 
        ? { balance: editCardData.balance }
        : { 
            creditLimit: editCardData.creditLimit,
            paymentDate: editCardData.paymentDate
          }
      )
    };

    actions.updateCard(updatedCard);
    setShowEditCardModal(false);
    setEditCardData({ name: '', type: 'debit', balance: 0, creditLimit: 0, paymentDate: '' });
  };

  const cancelEditCard = () => {
    setShowEditCardModal(false);
    setEditCardData({ name: '', type: 'debit', balance: 0, creditLimit: 0, paymentDate: '' });
  };

  const confirmDeleteCard = () => {
    if (cardToDelete) {
      actions.deleteCard(cardToDelete.id);
      
      // Adjust current index if needed
      if (currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(Math.max(0, cards.length - 2));
      }
      
      setShowDeleteCardModal(false);
      setCardToDelete(null);
    }
  };

  const cancelDeleteCard = () => {
    setShowDeleteCardModal(false);
    setCardToDelete(null);
  };

  // Helper functions for grid button shortcuts
  const handleAddFundShortcut = () => {
    if (currentCardIndex >= cards.length) {
      Alert.alert('No Card Selected', 'Please select a card first to add funds.');
      return;
    }
    
    const currentCard = cards[currentCardIndex];
    setSelectedCard(currentCard);
    setFundOperation('add');
    setShowFundAmountModal(true);
  };

  const handleSubtractFundShortcut = () => {
    if (currentCardIndex >= cards.length) {
      Alert.alert('No Card Selected', 'Please select a card first to subtract funds.');
      return;
    }
    
    const currentCard = cards[currentCardIndex];
    setSelectedCard(currentCard);
    setFundOperation('subtract');
    setShowFundAmountModal(true);
  };

  // Export functionality - Text format
  const exportCardHistory = async () => {
    if (currentCardIndex >= cards.length) {
      Alert.alert('No Card Selected', 'Please select a card first to export its history.');
      return;
    }

    const currentCard = cards[currentCardIndex];
    const transactions = currentCardTransactions;

    try {
      // Calculate summary statistics
      const totalIncome = transactions
        .filter(t => t.operation === 'add')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.operation === 'subtract')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netAmount = totalIncome - totalExpenses;

      // Create a formatted report for sharing
      const reportText = `
eWallet Card History Report
============================

Card: ${currentCard.name} (${currentCard.type === 'debit' ? 'Debit' : 'Credit'})
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
--------
Total Income: $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Net Amount: $${netAmount.toFixed(2)}
Current Balance: $${(currentCard.balance || currentCard.currentSpending || 0).toFixed(2)}
Total Transactions: ${transactions.length}

TRANSACTION HISTORY:
-------------------
${transactions.length > 0 ? transactions.map(t => 
  `${t.date} | ${t.description} | ${t.category || 'Uncategorized'} | ${t.operation === 'add' ? '+' : '-'}$${t.amount.toFixed(2)}`
).join('\n') : 'No transactions found.'}
      `.trim();

      // Share the report
      const result = await Share.share({
        message: reportText,
        title: `Card History - ${currentCard.name}`,
      });

    } catch (error) {
      console.error('Error exporting card history:', error);
      Alert.alert('Error', 'Failed to export card history. Please try again.');
    }
  };


  // Delete all transaction history for current card
  const deleteCardHistory = () => {
    if (currentCardIndex >= cards.length) {
      Alert.alert('No Card Selected', 'Please select a card first.');
      return;
    }

    const currentCard = cards[currentCardIndex];
    
    Alert.alert(
      'Delete Transaction History',
      `Are you sure you want to delete all transaction history for "${currentCard.name}"?\n\nThis action cannot be undone. The card balance will remain unchanged.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Remove all transactions for the current card
            const updatedTransactions = transactionHistory.filter(
              transaction => transaction.cardId !== currentCard.id
            );
            
            // Update transactions in context
            deleteTransactionHistory(updatedTransactions);
            
            Alert.alert('Success', 'Transaction history has been deleted successfully.');
          }
        }
      ]
    );
  };

  const renderCard = (card, index) => {
    const inputRange = [
      (index - 1) * CARD_TOTAL_WIDTH,
      index * CARD_TOTAL_WIDTH,
      (index + 1) * CARD_TOTAL_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    if (index === cards.length) {
      // Add card button
      return (
        <View 
          key="add-card" 
          style={styles.cardContainer}
        >
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={handleAddCardPress}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.addCardIcon}>+</Text>
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Animated.View 
        key={card.id} 
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => handleCardPress(card)}
        >
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceTitle, { color: theme.colors.text }]}>{card.name}</Text>
              <Text style={[styles.cardType, { color: theme.colors.textSecondary }]}>{card.type === 'debit' ? 'Debit' : 'Credit'}</Text>
            </View>
            
            {card.type === 'debit' ? (
              <>
                <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>{formatCurrency(card.balance)}</Text>
                <Text style={[styles.expirationDate, { color: theme.colors.textSecondary }]}>EXP {card.expiryDate}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>{formatCurrency(card.currentSpending || 0)}</Text>
                <Text style={[styles.creditInfo, { color: theme.colors.textSecondary }]}>
                  Limit: {formatCurrency(card.creditLimit)}
                </Text>
                <Text style={[styles.creditInfo, { color: theme.colors.textSecondary }]}>
                  Due: {card.paymentDate}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Cards Slider */}
      <Animated.ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.cardsSlider}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_TOTAL_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={styles.cardsSliderContent}
        bounces={false}
        pagingEnabled={false}
        scrollEnabled={true}
      >
        {[...cards, null].map((card, index) => renderCard(card, index))}
      </Animated.ScrollView>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        {[...cards, null].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageDot,
              currentCardIndex === index && styles.pageDotActive
            ]}
            onPress={() => scrollToCard(index)}
          />
        ))}
      </View>

      {/* Action Grid */}
      <View style={[styles.actionGrid, { backgroundColor: 'transparent' }]}>
        <View style={styles.actionGridRow}>
          <TouchableOpacity 
            style={[styles.actionGridButton, { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(192, 192, 192, 0.3)' }]} 
            onPress={handleAddFundShortcut}
          >
            <FontAwesomeIcon 
              icon={faPlus} 
              size={24} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionGridButton, { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(192, 192, 192, 0.3)' }]} 
            onPress={handleSubtractFundShortcut}
          >
            <FontAwesomeIcon 
              icon={faMinus} 
              size={24} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* History */}
      <View style={[styles.historyCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {currentCardIndex < cards.length ? `${cards[currentCardIndex]?.name} History` : 'History'}
        </Text>
        {currentCardTransactions.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {currentCardIndex >= cards.length 
              ? 'No card selected' 
              : 'No transactions yet for this card. Start by adding funds!'}
          </Text>
        ) : (
          currentCardTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.historyInfo}>
                <View style={styles.historyIcon}>
                  <Text style={styles.historyIconText}>
                    {transaction.category ? getCategoryIcon(transaction.category) : '○'}
                  </Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={[styles.historyDescription, { color: theme.colors.text }]}>{transaction.description}</Text>
                  <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>{transaction.date}</Text>
                </View>
              </View>
              <Text style={[
                styles.historyAmount, 
                transaction.operation === 'add' ? styles.incomeAmount : styles.expenseAmount,
                { color: transaction.operation === 'add' ? theme.colors.income : theme.colors.expense }
              ]}>
                {transaction.operation === 'add' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        )}
        
        {/* Export Button */}
        {currentCardIndex < cards.length && (
          <TouchableOpacity 
            style={styles.modernExportButton}
            onPress={exportCardHistory}
            activeOpacity={0.8}
          >
            <Text style={styles.modernExportButtonText}>Export Report</Text>
          </TouchableOpacity>
        )}
        
        {/* Delete History Button */}
        {currentCardIndex < cards.length && currentCardTransactions.length > 0 && (
          <TouchableOpacity 
            style={styles.deleteHistoryButton}
            onPress={deleteCardHistory}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteHistoryButtonText}>Delete History</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Add New Card</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Card Name"
              placeholderTextColor="#FFFFFF"
              value={newCard.name}
              onChangeText={(text) => setNewCard({...newCard, name: text})}
            />
            
            <View style={styles.cardTypeSelector}>
              <TouchableOpacity
                style={[styles.cardTypeButton, newCard.type === 'debit' && styles.cardTypeButtonActive]}
                onPress={() => setNewCard({...newCard, type: 'debit'})}
              >
                <Text style={[styles.cardTypeText, newCard.type === 'debit' && styles.cardTypeTextActive]}>
                  Debit Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardTypeButton, newCard.type === 'credit' && styles.cardTypeButtonActive]}
                onPress={() => setNewCard({...newCard, type: 'credit'})}
              >
                <Text style={[styles.cardTypeText, newCard.type === 'credit' && styles.cardTypeTextActive]}>
                  Credit Card
                </Text>
              </TouchableOpacity>
            </View>
            
            {newCard.type === 'debit' ? (
              <TextInput
                style={styles.input}
                placeholder="Initial Balance"
                placeholderTextColor="#FFFFFF"
                value={newCard.balance.toString()}
                onChangeText={(text) => setNewCard({...newCard, balance: parseFloat(text) || 0})}
                keyboardType="numeric"
              />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Credit Limit"
                  placeholderTextColor="#FFFFFF"
                  value={newCard.creditLimit.toString()}
                  onChangeText={(text) => setNewCard({...newCard, creditLimit: parseFloat(text) || 0})}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Payment Date"
                  placeholderTextColor="#FFFFFF"
                  value={newCard.paymentDate}
                  onChangeText={(text) => setNewCard({...newCard, paymentDate: text})}
                />
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addNewCard}
              >
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Delete Card Modal */}
      <Modal
        visible={showDeleteCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDeleteCard}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Delete Card</Text>
            <Text style={styles.deleteConfirmText}>
              Are you sure you want to delete "{cardToDelete?.name}"? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDeleteCard}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteCard}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Card Options Modal */}
      <Modal
        visible={showCardOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCardOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.cardOptionsSubtitle}>
              {selectedCard?.name} - {selectedCard?.type === 'debit' ? 'Debit' : 'Credit'}
            </Text>
            
            <View style={styles.cardOptionsButtons}>
              <TouchableOpacity
                style={styles.cardOptionButton}
                onPress={handleManageFunds}
              >
                <Text style={styles.cardOptionButtonText}>Manage Funds</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cardOptionButton}
                onPress={handleEditCard}
              >
                <Text style={styles.cardOptionButtonText}>Edit Card Information</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cardOptionButton, styles.deleteOptionButton]}
                onPress={handleDeleteCard}
              >
                <Text style={[styles.cardOptionButtonText, styles.deleteOptionText]}>Delete Card</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cardOptionsCloseButton}
              onPress={() => setShowCardOptionsModal(false)}
            >
              <Text style={styles.cardOptionsCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Fund Operation Modal */}
      <Modal
        visible={showFundModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelFundOperation}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Manage Funds</Text>
            <Text style={styles.fundModalSubtitle}>
              {selectedCard?.name} - {selectedCard?.type === 'debit' ? 'Debit' : 'Credit'}
            </Text>
            
            <View style={styles.fundOperationButtons}>
              <TouchableOpacity
                style={styles.fundOperationButton}
                onPress={() => {
                  setFundOperation('add');
                  setShowFundModal(false);
                  setShowFundAmountModal(true);
                }}
              >
                <Text style={styles.fundOperationButtonText}>Add Funds</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fundOperationButton}
                onPress={() => {
                  setFundOperation('subtract');
                  setShowFundModal(false);
                  setShowFundAmountModal(true);
                }}
              >
                <Text style={styles.fundOperationButtonText}>Subtract Funds</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cardOptionsCloseButton}
              onPress={cancelFundOperation}
            >
              <Text style={styles.cardOptionsCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Fund Amount Modal */}
      <Modal
        visible={showFundAmountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFundAmountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>
              {fundOperation === 'add' ? 'Add Funds' : 'Subtract Funds'}
            </Text>
            <Text style={styles.fundModalSubtitle}>
              {selectedCard?.name} - {selectedCard?.type === 'debit' ? 'Debit' : 'Credit'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#FFFFFF"
              value={fundAmount}
              onChangeText={setFundAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Transaction name (optional)"
              placeholderTextColor="#FFFFFF"
              value={transactionName}
              onChangeText={setTransactionName}
            />
            
            {/* Category Selection */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryLabel}>Category (optional)</Text>
              <View style={styles.categoryButtons}>
                {getCurrentCategories().map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                  >
                    <Text style={styles.categoryButtonIcon}>{getCategoryIcon(category)}</Text>
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryButtonText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowFundAmountModal(false);
                  setTransactionName('');
                  setSelectedCategory('');
                }}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={processFundOperation}
              >
                <Text style={styles.addButtonText}>
                  {fundOperation === 'add' ? 'Add' : 'Subtract'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        visible={showEditCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelEditCard}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Edit Card Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Card Name"
              placeholderTextColor="#FFFFFF"
              value={editCardData.name}
              onChangeText={(text) => setEditCardData({...editCardData, name: text})}
            />
            
            <View style={styles.cardTypeSelector}>
              <TouchableOpacity
                style={[styles.cardTypeButton, editCardData.type === 'debit' && styles.cardTypeButtonActive]}
                onPress={() => setEditCardData({...editCardData, type: 'debit'})}
              >
                <Text style={[styles.cardTypeText, editCardData.type === 'debit' && styles.cardTypeTextActive]}>
                  Debit Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardTypeButton, editCardData.type === 'credit' && styles.cardTypeButtonActive]}
                onPress={() => setEditCardData({...editCardData, type: 'credit'})}
              >
                <Text style={[styles.cardTypeText, editCardData.type === 'credit' && styles.cardTypeTextActive]}>
                  Credit Card
                </Text>
              </TouchableOpacity>
            </View>
            
            {editCardData.type === 'debit' ? (
              <TextInput
                style={styles.input}
                placeholder="Balance"
                placeholderTextColor="#FFFFFF"
                value={editCardData.balance.toString()}
                onChangeText={(text) => setEditCardData({...editCardData, balance: parseFloat(text) || 0})}
                keyboardType="numeric"
              />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Credit Limit"
                  placeholderTextColor="#FFFFFF"
                  value={editCardData.creditLimit.toString()}
                  onChangeText={(text) => setEditCardData({...editCardData, creditLimit: parseFloat(text) || 0})}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Payment Date"
                  placeholderTextColor="#FFFFFF"
                  value={editCardData.paymentDate}
                  onChangeText={(text) => setEditCardData({...editCardData, paymentDate: text})}
                />
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEditCard}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={saveEditCard}
              >
                <Text style={styles.addButtonText}>Save</Text>
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
  balanceCard: {
    padding: 25,
    borderRadius: 20,
    height: 180,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  cardType: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 10,
  },
  expirationDate: {
    fontSize: 14,
    color: '#999999',
    opacity: 0.5,
  },
  actionGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  actionGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 30,
  },
  actionGridButton: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGridButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyCard: {
    backgroundColor: '#121212',
    margin: 20,
    marginBottom: 100,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 20,
  },
  modernExportButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernExportButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteHistoryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 192, 0.5)',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#A0A0A0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  historyIconText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyDetails: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#2C2C2C',
  },
  expenseAmount: {
    color: '#2C2C2C',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
  // Card slider styles
  cardsSlider: {
    marginVertical: 20,
    height: 200,
  },
  cardsSliderContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cardContainer: {
    width: Dimensions.get('window').width * 0.85,
    marginHorizontal: 10,
    marginRight: 10,
  },
  addCardButton: {
    width: '100%',
    height: 180,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(204, 204, 204, 0.5)',
    borderStyle: 'dashed',
  },
  addCardIcon: {
    color: 'rgba(204, 204, 204, 0.5)',
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 8,
  },
  addCardText: {
    color: 'rgba(204, 204, 204, 0.5)',
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
  },
  pageDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditInfo: {
    fontSize: 14,
    color: '#666666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,

  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
  },
  cardTypeSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  cardTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  cardTypeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  cardTypeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardTypeTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    width: '100%',
    alignItems: 'stretch',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  deleteConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  deleteConfirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardOptionsSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardOptionsButtons: {
    marginBottom: 20,
  },
  cardOptionButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cardOptionButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  deleteOptionButton: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  deleteOptionText: {
    color: '#FFFFFF',
  },
  fundModalSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  cardOptionsCloseButton: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    marginTop: 10,
  },
  cardOptionsCloseButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fundOperationButtons: {
    marginBottom: 20,
  },
  fundOperationButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  fundOperationButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  categorySection: {
    marginVertical: 15,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  selectedCategoryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default Dashboard;