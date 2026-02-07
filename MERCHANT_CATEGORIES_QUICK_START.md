# Merchant Categories - Quick Start Guide

## 🚀 System is Ready!

Your merchant categories are fully deployed with:
- ✅ **16 parent categories** created
- ✅ **104 subcategories** created
- ✅ **All 104 Plaid PFC categories auto-mapped**
- ✅ Management UI integrated

---

## 📍 Access the Features

### **Option 1: From Merchants Table**
1. Go to **Merchants** page
2. Click any **Category** dropdown
3. You'll see two management options:
   - **⚙️ Manage Categories** (new!)
   - **⚙️ Manage Mappings**

### **Option 2: Direct Category Management**
- Click "Manage Categories" → Opens full category editor
- Click "Manage Mappings" → Opens Plaid PFC mapper

---

## 🎯 Quick Tasks

### **Task 1: View Your Categories**
```
1. Open Merchants table
2. Click any Category dropdown
3. Click "Manage Categories"
4. ✅ See all 16 parent categories with 104 subcategories
```

### **Task 2: Rename a Category**
```
1. Open "Manage Categories"
2. Find category (e.g., "Food and Drink")
3. Click in name field
4. Edit to "Dining" (or any name you prefer)
5. Click "Save Changes"
6. ✅ Category renamed everywhere!
```

### **Task 3: Add a New Subcategory**
```
1. Open "Manage Categories"
2. Expand a parent category
3. Click [+] button next to parent name
4. Edit the new "New Subcategory" row
5. Rename it (e.g., "Meal Kits")
6. Parent is auto-selected
7. Click "Save Changes"
8. ✅ New subcategory created!
```

### **Task 4: Create a Parent Category**
```
1. Open "Manage Categories"
2. Click "Add Category" button (top right)
3. Type name (e.g., "Subscriptions")
4. Press Enter
5. ✅ New parent category appears
6. Click [+] to add subcategories
```

### **Task 5: Move a Subcategory**
```
1. Open "Manage Categories"
2. Expand any parent
3. Find a subcategory
4. Change the parent dropdown
5. Click "Save Changes"
6. ✅ Subcategory moved to new parent!
```

### **Task 6: View Plaid Mappings**
```
1. Open "Manage Categories"
2. Expand any parent
3. Look at subcategories
4. Hover over "X Plaid" badge
5. ✅ Tooltip shows mapped Plaid categories
```

---

## 🎨 UI Features

### **Collapsible View**
- Click parent name to expand/collapse
- "Expand All" / "Collapse All" buttons
- Organized, clean interface

### **Inline Editing**
- Click any field to edit
- No separate edit forms
- Immediate visual feedback

### **Plaid Mapping Info**
- Shows count of mapped Plaid categories
- Hover to see detailed names
- Helps understand auto-categorization

### **Bulk Operations**
- Edit multiple categories
- "X changes pending" counter
- Save all at once

---

## 📊 Your Current Setup

### **16 Parent Categories**:
1. Bank Fees (6 subcategories)
2. Entertainment (6 subcategories)
3. Food and Drink (7 subcategories)
4. General Merchandise (14 subcategories)
5. General Services (10 subcategories)
6. Government and Non Profit (4 subcategories)
7. Home Improvement (5 subcategories)
8. Income (7 subcategories)
9. Loan Payments (6 subcategories)
10. Medical (7 subcategories)
11. Personal Care (4 subcategories)
12. Rent and Utilities (7 subcategories)
13. Transfer In (6 subcategories)
14. Transfer Out (5 subcategories)
15. Transportation (6 subcategories)
16. Travel (4 subcategories)

**Total**: 104 subcategories, all with Plaid mappings

---

## 💡 Customization Ideas

### **Rename for Your Business**:
- "Food and Drink" → "Dining"
- "General Merchandise" → "Shopping"
- "General Services" → "Services"
- "Rent and Utilities" → "Bills"

### **Add Custom Categories**:
- "Business Expenses"
  - Office Supplies
  - Software Subscriptions
  - Professional Services
- "Investment Costs"
  - Trading Fees
  - Investment Management
  - Research Tools
- "Family & Personal"
  - Allowances
  - Gifts
  - Family Support

### **Reorganize Structure**:
- Combine related categories
- Split broad categories
- Create industry-specific groupings
- Match your accounting system

---

## 🔄 How It All Works Together

```
Transaction Syncs from Plaid
  ├─ Has Plaid PFC category (e.g., FOOD_AND_DRINK_RESTAURANT)
  │   └─ Plaid PFC Mapping looks up → Maps to "Restaurant"
  │       └─ Transaction auto-assigned → "Restaurant" category
  │           └─ Appears in Merchants table
  │               └─ You can edit/override anytime
  └─ Manual categorization also available
```

**Priority System**:
1. **Confirmed Merchant** (highest) - Always wins
2. **Plaid PFC Mapping** - Auto-applies if no confirmed merchant
3. **Manual Assignment** - You can always override

---

## 🎯 Best Practices

### **Start Simple**:
1. Use the default categories for a week
2. See which ones you actually use
3. Rename/consolidate based on actual usage

### **Customize Gradually**:
1. Rename top 5 most-used categories
2. Add 2-3 custom categories you need
3. Reorganize subcategories as needed

### **Regular Maintenance**:
1. Check "Manage Categories" monthly
2. Delete unused categories
3. Add new ones as business evolves
4. Update Plaid mappings if needed

---

## ⚡ Pro Tips

1. **Use Color Coding**
   - Each parent has a color
   - Subcategories inherit
   - Visual category identification

2. **Hover for Details**
   - Plaid mapping counts
   - See what's mapped
   - Understand auto-categorization

3. **Bulk Edit**
   - Make multiple changes
   - Save all at once
   - Efficient workflow

4. **Keep It Organized**
   - Logical parent-child structure
   - Consistent naming
   - Clear descriptions

---

## 🆘 Need Help?

### **Category not showing in dropdown?**
- Check if it's a subcategory (only subcategories selectable)
- Refresh the page
- Check if parent was deleted

### **Plaid mappings not working?**
- Check "Manage Mappings" dialog
- Verify Plaid category is mapped
- Ensure merchant isn't "confirmed" (which overrides)

### **Changes not saving?**
- Click "Save Changes" button
- Check for error messages
- Verify network connection

---

## 🎉 You're All Set!

Your merchant category system is fully operational:
- ✅ 120 categories ready to use
- ✅ 104 Plaid mappings active
- ✅ Full CRUD management
- ✅ Auto-categorization working

**Start customizing your categories now!** 🚀
