import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  APP_DATA: '@eWallet_app_data',
  CARDS: '@eWallet_cards',
  TRANSACTION_HISTORY: '@eWallet_transaction_history',
  CATEGORIES: '@eWallet_categories',
  SUMMARY: '@eWallet_summary'
};

// Storage utility functions
const StorageUtils = {
  // Save entire app state
  saveAppData: async (state) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app data:', error);
    }
  },

  // Load entire app state
  loadAppData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading app data:', error);
      return null;
    }
  },

  // Save specific data sections
  saveCards: async (cards) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  },

  saveTransactionHistory: async (transactions) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  },

  saveCategories: async (categories) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  saveSummary: async (summary) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUMMARY, JSON.stringify(summary));
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  },

  // Load specific data sections
  loadCards: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CARDS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading cards:', error);
      return null;
    }
  },

  loadTransactionHistory: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return null;
    }
  },

  loadCategories: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading categories:', error);
      return null;
    }
  },

  loadSummary: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading summary:', error);
      return null;
    }
  }
};

// Initial state
const initialState = {
  cards: [
    {
      id: '1',
      type: 'debit',
      name: 'Main Debit Card',
      balance: 2500.00,
      expiryDate: '09/26'
    }
  ],
  expenses: [],
  income: [],
  transactionHistory: [],
  categories: {
    addFundCategories: ['Salary', 'Transfer', 'Allowance'],
    subtractFundCategories: ['Dining', 'Shopping', 'Groceries']
  },
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyBudget: 5000
  }
};

// Action types
const ActionTypes = {
  ADD_CARD: 'ADD_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  UPDATE_CARD_BALANCE: 'UPDATE_CARD_BALANCE',
  ADD_EXPENSE: 'ADD_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  ADD_INCOME: 'ADD_INCOME',
  DELETE_INCOME: 'DELETE_INCOME',
  ADD_TRANSACTION_HISTORY: 'ADD_TRANSACTION_HISTORY',
  DELETE_TRANSACTION_HISTORY: 'DELETE_TRANSACTION_HISTORY',
  UPDATE_SUMMARY: 'UPDATE_SUMMARY',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  LOAD_DATA: 'LOAD_DATA'
};

// Reducer function with auto-save
const appReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case ActionTypes.ADD_CARD:
      newState = {
        ...state,
        cards: [...state.cards, action.payload]
      };
      break;

    case ActionTypes.UPDATE_CARD:
      newState = {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id ? { ...card, ...action.payload } : card
        )
      };
      break;

    case ActionTypes.DELETE_CARD:
      newState = {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
      break;

    case ActionTypes.UPDATE_CARD_BALANCE:
      newState = {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.cardId 
            ? { ...card, balance: action.payload.newBalance }
            : card
        )
      };
      break;

    case ActionTypes.ADD_EXPENSE:
      newState = {
        ...state,
        expenses: [action.payload, ...state.expenses]
      };
      break;

    case ActionTypes.DELETE_EXPENSE:
      newState = {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
      break;

    case ActionTypes.ADD_INCOME:
      newState = {
        ...state,
        income: [action.payload, ...state.income]
      };
      break;

    case ActionTypes.DELETE_INCOME:
      newState = {
        ...state,
        income: state.income.filter(income => income.id !== action.payload)
      };
      break;

    case ActionTypes.ADD_TRANSACTION_HISTORY:
      newState = {
        ...state,
        transactionHistory: [action.payload, ...state.transactionHistory]
      };
      break;

    case ActionTypes.DELETE_TRANSACTION_HISTORY:
      newState = {
        ...state,
        transactionHistory: action.payload
      };
      break;

    case ActionTypes.UPDATE_SUMMARY:
      newState = {
        ...state,
        summary: { ...state.summary, ...action.payload }
      };
      break;

    case ActionTypes.ADD_CATEGORY:
      newState = {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: [...state.categories[action.payload.type], action.payload.name]
        }
      };
      break;

    case ActionTypes.UPDATE_CATEGORY:
      newState = {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: state.categories[action.payload.type].map(cat => 
            cat === action.payload.oldName ? action.payload.newName : cat
          )
        }
      };
      break;

    case ActionTypes.DELETE_CATEGORY:
      newState = {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: state.categories[action.payload.type].filter(cat => cat !== action.payload.name)
        }
      };
      break;

    case ActionTypes.LOAD_DATA:
      newState = action.payload;
      break;

    default:
      return state;
  }

  // Auto-save to storage after each state change
  if (newState) {
    StorageUtils.saveAppData(newState);
  }

  return newState || state;
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from storage on app start
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await StorageUtils.loadAppData();
        if (storedData) {
          dispatch({ type: ActionTypes.LOAD_DATA, payload: storedData });
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Action creators
  const actions = {
    addCard: (card) => dispatch({ type: ActionTypes.ADD_CARD, payload: card }),
    
    updateCard: (card) => dispatch({ type: ActionTypes.UPDATE_CARD, payload: card }),
    
    deleteCard: (cardId) => dispatch({ type: ActionTypes.DELETE_CARD, payload: cardId }),
    
    updateCardBalance: (cardId, newBalance) => 
      dispatch({ 
        type: ActionTypes.UPDATE_CARD_BALANCE, 
        payload: { cardId, newBalance } 
      }),
    
    addExpense: (expense) => dispatch({ type: ActionTypes.ADD_EXPENSE, payload: expense }),
    
    deleteExpense: (expenseId) => dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: expenseId }),
    
    addIncome: (income) => dispatch({ type: ActionTypes.ADD_INCOME, payload: income }),
    
    deleteIncome: (incomeId) => dispatch({ type: ActionTypes.DELETE_INCOME, payload: incomeId }),
    
    addTransactionHistory: (transaction) => dispatch({ type: ActionTypes.ADD_TRANSACTION_HISTORY, payload: transaction }),
    
    deleteTransactionHistory: (updatedTransactions) => dispatch({ type: ActionTypes.DELETE_TRANSACTION_HISTORY, payload: updatedTransactions }),
    
    updateSummary: (summaryData) => dispatch({ type: ActionTypes.UPDATE_SUMMARY, payload: summaryData }),
    
    addCategory: (type, name) => dispatch({ 
      type: ActionTypes.ADD_CATEGORY, 
      payload: { type, name } 
    }),
    
    updateCategory: (type, oldName, newName) => dispatch({ 
      type: ActionTypes.UPDATE_CATEGORY, 
      payload: { type, oldName, newName } 
    }),
    
    deleteCategory: (type, name) => dispatch({ 
      type: ActionTypes.DELETE_CATEGORY, 
      payload: { type, name } 
    }),

    loadData: (data) => dispatch({ 
      type: ActionTypes.LOAD_DATA, 
      payload: data 
    })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
