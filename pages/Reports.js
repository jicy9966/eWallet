import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const Reports = () => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // Back to reasonable width

  // Get global state
  const { state } = useAppContext();
  const { expenses, income, transactionHistory } = state;

  // Get data for the past 7 days (including today)
  const getWeeklyData = () => {
    const days = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Format day label
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      days.push(dayLabel);
      
      // Get the date string in the same format as Dashboard uses
      const dateString = date.toLocaleDateString();
      
      // Calculate income for this day from both income array and transaction history
      const dayIncome = [
        ...income.filter(entry => entry.date === dateString),
        ...transactionHistory.filter(transaction => 
          transaction.date === dateString && transaction.operation === 'add'
        )
      ].reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate expenses for this day from both expenses array and transaction history
      const dayExpenses = [
        ...expenses.filter(expense => expense.date === dateString),
        ...transactionHistory.filter(transaction => 
          transaction.date === dateString && transaction.operation === 'subtract'
        )
      ].reduce((sum, item) => sum + item.amount, 0);
      
      incomeData.push(dayIncome);
      expenseData.push(dayExpenses);
    }
    
    return { days, incomeData, expenseData };
  };

  const weeklyData = getWeeklyData();
  
  // Calculate totals for the past 7 days
  const totalIncome = weeklyData.incomeData.reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = weeklyData.expenseData.reduce((sum, amount) => sum + amount, 0);
  const netAmount = totalIncome - totalExpenses;

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Custom chart component
  const CustomChart = () => {
    const maxValue = Math.max(
      ...weeklyData.incomeData,
      ...weeklyData.expenseData,
      1 // Ensure we have at least 1 for scaling
    );
    
    const chartHeight = 180; // Updated to match container height
    const barWidth = (chartWidth - 40) / 7; // 7 days, with some padding
    const barSpacing = 5;

    return (
      <View style={styles.customChartContainer}>
        {/* Chart bars */}
        <View style={styles.chartBarsContainer}>
          {weeklyData.days.map((day, index) => {
            // Calculate bar heights with proper spacing for labels
            const availableHeight = chartHeight - 40; // Reserve more space for labels (40px)
            const incomeHeight = Math.min((weeklyData.incomeData[index] / maxValue) * availableHeight, availableHeight - 10); // Cap height
            const expenseHeight = Math.min((weeklyData.expenseData[index] / maxValue) * availableHeight, availableHeight - 10); // Cap height
            
            return (
              <View key={index} style={styles.dayColumn}>
                {/* Bars */}
                <View style={styles.barsContainer}>
                  {/* Income bar */}
                  {weeklyData.incomeData[index] > 0 && (
                    <View
                      style={[
                        styles.bar,
                        styles.incomeBar,
                        { height: incomeHeight }
                      ]}
                    />
                  )}
                  
                  {/* Expense bar */}
                  {weeklyData.expenseData[index] > 0 && (
                    <View
                      style={[
                        styles.bar,
                        styles.expenseBar,
                        { height: expenseHeight }
                      ]}
                    />
                  )}
                </View>
                
                {/* Day label */}
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Report</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Past 7 days overview</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total{`\n`}Added</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total{`\n`}Subtracted</Text>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Net{`\n`}Amount</Text>
          <Text style={[styles.summaryAmount, netAmount >= 0 ? styles.incomeAmount : styles.expenseAmount]}>
            {formatCurrency(netAmount)}
          </Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Daily Overview</Text>
        
        <CustomChart />
      </View>

      {/* Daily Breakdown */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        {weeklyData.days.map((day, index) => (
          <View key={index} style={styles.dayItem}>
            <Text style={styles.dayLabel}>{day}</Text>
            <View style={styles.dayAmounts}>
              <Text style={[styles.dayAmount, styles.incomeAmount]}>
                +{formatCurrency(weeklyData.incomeData[index])}
              </Text>
              <Text style={[styles.dayAmount, styles.expenseAmount]}>
                -{formatCurrency(weeklyData.expenseData[index])}
              </Text>
            </View>
          </View>
        ))}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 15,
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
  summaryLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
    numberOfLines: 2,
    lineHeight: 14,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    numberOfLines: 1,
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#FF6B6B',
  },
  chartSection: {
    margin: 15,
    backgroundColor: '#E0E0E0',
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  // Custom chart styles
  customChartContainer: {
    height: 220, // Increased height to accommodate all elements
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180, // Reduced height to prevent overflow
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    maxHeight: 180, // Prevent bars from exceeding container
  },
  valuesContainer: {
    alignItems: 'center',
    minHeight: 30, // Fixed height for values
    justifyContent: 'flex-start',
  },
  valueText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 60, // Minimum space for bars
  },
  bar: {
    width: 12,
    borderRadius: 2,
  },
  incomeBar: {
    backgroundColor: '#4CAF50',
  },
  expenseBar: {
    backgroundColor: '#FF6B6B',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginTop: 5,
    minHeight: 20, // Fixed height for day labels
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 10,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C2C2C',
    flex: 1,
  },
  dayAmounts: {
    flexDirection: 'row',
    gap: 15,
  },
  dayAmount: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Reports;