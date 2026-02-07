#!/usr/bin/env tsx

/**
 * Seed script to add realistic test transactions with complete Plaid data
 * Run with: npx tsx scripts/seed-test-transactions.ts
 */

import Database from "better-sqlite3";
import { join } from "path";
import { randomUUID } from "crypto";

const dbPath = join(process.cwd(), "finance.db");
const db = new Database(dbPath);

// Generate UUID
function generateId(): string {
  return randomUUID();
}

// Get a random plaid_item_id from database, or create a test one
function getOrCreateTestItemId(): string {
  const item = db.prepare("SELECT id FROM plaid_items LIMIT 1").get() as { id: string } | undefined;
  
  if (item) {
    return item.id;
  }
  
  // Create a test item if none exists
  const testItemId = generateId();
  db.prepare(`
    INSERT INTO plaid_items (
      id, item_id, access_token, institution_id, institution_name,
      account_type, account_name, custom_name, is_hidden,
      current_balance, balance_currency_code, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testItemId,
    `item_test_${generateId()}`,
    "test_access_token",
    "ins_109508",
    "First Platypus Bank",
    "Cash",
    "Checking Account",
    "Test Checking",
    0,
    5000.00,
    "USD",
    "active"
  );
  
  return testItemId;
}

// Test transactions with complete Plaid data
const testTransactions = [
  {
    merchant_name: "Whole Foods Market",
    amount: -125.43,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_1234567890",
    logo_url: "https://logo.clearbit.com/wholefoodsmarket.com",
    website: "https://www.wholefoodsmarket.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "123 Main Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94102",
      country: "US",
      lat: 37.7749,
      lon: -122.4194,
    },
    payment_meta: {
      reference_number: "REF123456",
      ppd_id: null,
      payee: "Whole Foods Market",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "FOOD_AND_DRINK",
      detailed: "FOOD_AND_DRINK_GROCERIES",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "WHOLE FOODS MARKET #123",
    counterparties: [
      {
        name: "Whole Foods Market",
        entity_id: "m_1234567890",
        type: "merchant",
        website: "https://www.wholefoodsmarket.com",
        logo_url: "https://logo.clearbit.com/wholefoodsmarket.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_FOOD_AND_DRINK.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Shell",
    amount: -45.67,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_9876543210",
    logo_url: "https://logo.clearbit.com/shell.com",
    website: "https://www.shell.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "456 Market Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94105",
      country: "US",
      lat: 37.7849,
      lon: -122.4094,
    },
    payment_meta: {
      reference_number: "REF789012",
      ppd_id: null,
      payee: "Shell",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_MERCHANDISE",
      detailed: "GENERAL_MERCHANDISE_GAS_STATIONS",
      confidence_level: "HIGH",
      version: "v2",
    },
    original_description: "SHELL OIL 1234567890",
    counterparties: [
      {
        name: "Shell",
        entity_id: "m_shell123",
        type: "merchant",
        website: "https://www.shell.com",
        logo_url: "https://logo.clearbit.com/shell.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Starbucks",
    amount: -8.95,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_5555555555",
    logo_url: "https://logo.clearbit.com/starbucks.com",
    website: "https://www.starbucks.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "789 Mission Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94103",
      country: "US",
      lat: 37.7849,
      lon: -122.3994,
    },
    payment_meta: {
      reference_number: "REF345678",
      ppd_id: null,
      payee: "Starbucks",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "FOOD_AND_DRINK",
      detailed: "FOOD_AND_DRINK_RESTAURANTS",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "STARBUCKS STORE #12345",
    counterparties: [
      {
        name: "Starbucks",
        entity_id: "m_starbucks123",
        type: "merchant",
        website: "https://www.starbucks.com",
        logo_url: "https://logo.clearbit.com/starbucks.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_FOOD_AND_DRINK.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Amazon",
    amount: -89.99,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "online",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_amazon123",
    logo_url: "https://logo.clearbit.com/amazon.com",
    website: "https://www.amazon.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: null,
      city: "Seattle",
      region: "WA",
      postal_code: "98101",
      country: "US",
      lat: 47.6062,
      lon: -122.3321,
    },
    payment_meta: {
      reference_number: "AMZ-1234567890",
      ppd_id: null,
      payee: "Amazon.com",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_MERCHANDISE",
      detailed: "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "AMAZON.COM PURCHASE",
    counterparties: [
      {
        name: "Amazon",
        entity_id: "m_amazon123",
        type: "merchant",
        website: "https://www.amazon.com",
        logo_url: "https://logo.clearbit.com/amazon.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "ACME Corporation",
    amount: 3500.00,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "other",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_acme_corp",
    logo_url: null,
    website: "https://www.acmecorp.com",
    account_owner: null,
    pending_transaction_id: null,
    location: null,
    payment_meta: {
      reference_number: "PAY-2026-01-15",
      ppd_id: "PPD123456",
      payee: "ACME Corporation",
      by_order_of: null,
      payer: "ACME Corporation",
      payment_method: "ach",
      payment_processor: null,
      reason: "payroll",
    },
    personal_finance_category_detailed: {
      primary: "INCOME",
      detailed: "INCOME_WAGES",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "DIRECT DEPOSIT PAYROLL",
    counterparties: [
      {
        name: "ACME Corporation",
        entity_id: "m_acme_corp",
        type: "income_source",
        website: "https://www.acmecorp.com",
        logo_url: null,
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_INCOME.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Uber",
    amount: -23.45,
    date: new Date().toISOString().split("T")[0],
    authorized_date: new Date().toISOString().split("T")[0],
    authorized_datetime: new Date().toISOString(),
    datetime: new Date().toISOString(),
    pending: true,
    payment_channel: "online",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_uber123",
    logo_url: "https://logo.clearbit.com/uber.com",
    website: "https://www.uber.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "123 Market St",
      city: "San Francisco",
      region: "CA",
      postal_code: "94102",
      country: "US",
      lat: 37.7849,
      lon: -122.4094,
    },
    payment_meta: {
      reference_number: "UBER-789012",
      ppd_id: null,
      payee: "Uber",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_SERVICES",
      detailed: "GENERAL_SERVICES_TAXI_AND_RIDESHARE",
      confidence_level: "HIGH",
      version: "v2",
    },
    original_description: "UBER TRIP",
    counterparties: [
      {
        name: "Uber",
        entity_id: "m_uber123",
        type: "merchant",
        website: "https://www.uber.com",
        logo_url: "https://logo.clearbit.com/uber.com",
        confidence_level: "HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Pacific Gas & Electric",
    amount: -125.00,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "other",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: "1234",
    merchant_entity_id: "m_pge123",
    logo_url: "https://logo.clearbit.com/pge.com",
    website: "https://www.pge.com",
    account_owner: null,
    pending_transaction_id: null,
    location: null,
    payment_meta: {
      reference_number: "CHK-1234",
      ppd_id: null,
      payee: "Pacific Gas & Electric",
      by_order_of: null,
      payer: null,
      payment_method: "check",
      payment_processor: null,
      reason: "utility",
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_SERVICES",
      detailed: "GENERAL_SERVICES_UTILITIES",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "CHECK #1234",
    counterparties: [
      {
        name: "Pacific Gas & Electric",
        entity_id: "m_pge123",
        type: "merchant",
        website: "https://www.pge.com",
        logo_url: null,
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_RENT_AND_UTILITIES.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Bank of America ATM",
    amount: -100.00,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "other",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: null,
    logo_url: null,
    website: null,
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "100 Market Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94102",
      country: "US",
      lat: 37.7949,
      lon: -122.4094,
    },
    payment_meta: {
      reference_number: null,
      ppd_id: null,
      payee: null,
      by_order_of: null,
      payer: null,
      payment_method: "atm",
      payment_processor: null,
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_MERCHANDISE",
      detailed: "GENERAL_MERCHANDISE_ATM",
      confidence_level: "MEDIUM",
      version: "v2",
    },
    original_description: "ATM WITHDRAWAL",
    counterparties: [
      {
        name: "Bank of America",
        entity_id: "m_bofa123",
        type: "financial_institution",
        website: "https://www.bankofamerica.com",
        logo_url: null,
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Netflix",
    amount: -15.99,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "online",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_netflix123",
    logo_url: "https://logo.clearbit.com/netflix.com",
    website: "https://www.netflix.com",
    account_owner: null,
    pending_transaction_id: null,
    location: null,
    payment_meta: {
      reference_number: "NFX-987654",
      ppd_id: null,
      payee: "Netflix",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: "subscription",
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_SERVICES",
      detailed: "GENERAL_SERVICES_SUBSCRIPTION",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "NETFLIX.COM",
    counterparties: [
      {
        name: "Netflix",
        entity_id: "m_netflix123",
        type: "merchant",
        website: "https://www.netflix.com",
        logo_url: "https://logo.clearbit.com/netflix.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Target",
    amount: -234.56,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_target123",
    logo_url: "https://logo.clearbit.com/target.com",
    website: "https://www.target.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "567 Market Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94104",
      country: "US",
      lat: 37.7949,
      lon: -122.3994,
    },
    payment_meta: {
      reference_number: "TGT-456789",
      ppd_id: null,
      payee: "Target",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_MERCHANDISE",
      detailed: "GENERAL_MERCHANDISE_SUPERSTORES",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "TARGET STORE #1234",
    counterparties: [
      {
        name: "Target",
        entity_id: "m_target123",
        type: "merchant",
        website: "https://www.target.com",
        logo_url: "https://logo.clearbit.com/target.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Apple",
    amount: -29.99,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "online",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_apple123",
    logo_url: "https://logo.clearbit.com/apple.com",
    website: "https://www.apple.com",
    account_owner: null,
    pending_transaction_id: null,
    location: null,
    payment_meta: {
      reference_number: "APP-789456",
      ppd_id: null,
      payee: "Apple",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: "subscription",
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_SERVICES",
      detailed: "GENERAL_SERVICES_SUBSCRIPTION",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "APPLE.COM/BILL",
    counterparties: [
      {
        name: "Apple",
        entity_id: "m_apple123",
        type: "merchant",
        website: "https://www.apple.com",
        logo_url: "https://logo.clearbit.com/apple.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Chevron",
    amount: -52.34,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_chevron123",
    logo_url: "https://logo.clearbit.com/chevron.com",
    website: "https://www.chevron.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "890 Market Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94106",
      country: "US",
      lat: 37.8049,
      lon: -122.4194,
    },
    payment_meta: {
      reference_number: "CHV-123789",
      ppd_id: null,
      payee: "Chevron",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "GENERAL_MERCHANDISE",
      detailed: "GENERAL_MERCHANDISE_GAS_STATIONS",
      confidence_level: "HIGH",
      version: "v2",
    },
    original_description: "CHEVRON STATION",
    counterparties: [
      {
        name: "Chevron",
        entity_id: "m_chevron123",
        type: "merchant",
        website: "https://www.chevron.com",
        logo_url: "https://logo.clearbit.com/chevron.com",
        confidence_level: "HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
    personal_finance_category_version: "v2",
  },
  {
    merchant_name: "Chipotle",
    amount: -12.50,
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorized_datetime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    datetime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    pending: false,
    payment_channel: "in store",
    transaction_code: null,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    check_number: null,
    merchant_entity_id: "m_chipotle123",
    logo_url: "https://logo.clearbit.com/chipotle.com",
    website: "https://www.chipotle.com",
    account_owner: null,
    pending_transaction_id: null,
    location: {
      address: "234 Mission Street",
      city: "San Francisco",
      region: "CA",
      postal_code: "94105",
      country: "US",
      lat: 37.7849,
      lon: -122.4094,
    },
    payment_meta: {
      reference_number: "CHP-456123",
      ppd_id: null,
      payee: "Chipotle",
      by_order_of: null,
      payer: null,
      payment_method: "card",
      payment_processor: "visa",
      reason: null,
    },
    personal_finance_category_detailed: {
      primary: "FOOD_AND_DRINK",
      detailed: "FOOD_AND_DRINK_RESTAURANTS",
      confidence_level: "VERY_HIGH",
      version: "v2",
    },
    original_description: "CHIPOTLE MEXICAN GRILL",
    counterparties: [
      {
        name: "Chipotle",
        entity_id: "m_chipotle123",
        type: "merchant",
        website: "https://www.chipotle.com",
        logo_url: "https://logo.clearbit.com/chipotle.com",
        confidence_level: "VERY_HIGH",
      },
    ],
    personal_finance_category_icon_url: "https://plaid-category-icons.plaid.com/PFC_FOOD_AND_DRINK.png",
    personal_finance_category_version: "v2",
  },
];

// Insert transactions
const plaidItemId = getOrCreateTestItemId();
const accountId = `acc_test_${generateId()}`;

console.log(`Seeding ${testTransactions.length} test transactions...`);

const insertStmt = db.prepare(`
  INSERT INTO transactions (
    id, plaid_transaction_id, plaid_item_id, account_id, date, amount,
    merchant_name, name, entity_id, category_id, pending,
    notes, is_recurring, payment_channel, transaction_code,
    iso_currency_code, unofficial_currency_code,
    authorized_date, authorized_datetime, datetime,
    check_number, merchant_entity_id, logo_url, website,
    account_owner, pending_transaction_id,
    location, payment_meta, personal_finance_category_detailed, original_description,
    counterparties, personal_finance_category_icon_url, personal_finance_category_version,
    is_reviewed
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((transactions) => {
  for (const txn of transactions) {
    const id = generateId();
    const plaidTransactionId = `txn_test_${id}`;
    
    insertStmt.run(
      id,
      plaidTransactionId,
      plaidItemId,
      accountId,
      txn.date,
      txn.amount,
      txn.merchant_name,
      txn.original_description || txn.merchant_name || "", // name (deprecated, but required by schema)
      null, // entity_id
      null, // category_id
      txn.pending ? 1 : 0,
      null, // notes
      0, // is_recurring = false
      txn.payment_channel,
      txn.transaction_code,
      txn.iso_currency_code,
      txn.unofficial_currency_code,
      txn.authorized_date,
      txn.authorized_datetime,
      txn.datetime,
      txn.check_number,
      txn.merchant_entity_id,
      txn.logo_url,
      txn.website,
      txn.account_owner,
      txn.pending_transaction_id,
      JSON.stringify(txn.location),
      JSON.stringify(txn.payment_meta),
      JSON.stringify(txn.personal_finance_category_detailed),
      txn.original_description,
      JSON.stringify(txn.counterparties || null),
      txn.personal_finance_category_icon_url || null,
      txn.personal_finance_category_version || null,
      0, // is_reviewed = false
    );
  }
});

insertMany(testTransactions);

console.log(`✅ Successfully seeded ${testTransactions.length} test transactions!`);
console.log(`\nTransaction types:`);
console.log(`- Groceries: Whole Foods ($125.43)`);
console.log(`- Gas: Shell ($45.67)`);
console.log(`- Restaurant: Starbucks ($8.95)`);
console.log(`- Online: Amazon ($89.99)`);
console.log(`- Income: Salary deposit ($3,500.00)`);
console.log(`- Pending: Uber trip ($23.45)`);
console.log(`- Check: Utility payment ($125.00)`);
console.log(`- ATM: Cash withdrawal ($100.00)`);
console.log(`- Subscription: Netflix ($15.99)`);
console.log(`- Superstore: Target ($234.56)`);
console.log(`- Subscription: Apple ($29.99)`);
console.log(`- Gas: Chevron ($52.34)`);
console.log(`- Restaurant: Chipotle ($12.50)`);
console.log(`\nAll transactions include:`);
console.log(`✓ Complete location data (address, city, state, coordinates)`);
console.log(`✓ Payment metadata (method, processor, reference numbers)`);
console.log(`✓ Personal Finance Category (primary, detailed, confidence)`);
console.log(`✓ Merchant logos and websites`);
console.log(`✓ Authorized dates and timestamps`);
console.log(`✓ Payment channels and transaction types`);

db.close();
