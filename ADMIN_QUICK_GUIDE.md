# Admin Quick Reference Guide

## 🔐 Admin Login

**Access URL:** `/admin` or `/admin/login`

**Authorized Emails:**
- aminulislam004474@gmail.com
- shahsultanweb@gmail.com

**Steps:**
1. Go to `/admin`
2. Click "Sign in with Google"
3. Select authorized email
4. You're in!

---

## 👥 Student Management

### Dashboard Overview

**Location:** Admin Panel → Student Management

**Statistics Cards:**
- 📊 Total Students - All registered students
- ⏰ Pending Approval - Students waiting (needs action!)
- ✅ Approved - Students with full access
- ❌ Rejected - Rejected applications

### Student Status Meanings

| Status | Icon | Meaning | What Student Sees |
|--------|------|---------|-------------------|
| 🟡 Pending | ⏰ | Waiting for your approval | "Waiting for Approval" page |
| 🟢 Approved | ✅ | Full access granted | Can access dashboard & exams |
| 🔴 Rejected | ❌ | Application denied | Rejection message |
| ⚫ Inactive | 🚫 | Temporarily disabled | Cannot access (can reactivate) |

---

## 🎯 Quick Actions

### Approve a Student
1. Find student with "Pending" status
2. Click ✅ (checkmark icon)
3. Confirm approval
4. ✨ Student can now access everything!

### Reject a Student
1. Find student with "Pending" status
2. Click ❌ (X icon)
3. Confirm rejection
4. Student sees rejection message

### View Student Details
1. Click 👁️ (eye icon) on any student
2. See complete profile:
   - Personal info
   - Academic details
   - Registration date
   - System info
3. Can approve/reject directly from modal

### Deactivate an Approved Student
1. Find student with "Approved" status
2. Click 🔄 (toggle icon)
3. Confirm deactivation
4. Status changes to "Inactive"
5. Student loses access immediately

### Reactivate an Inactive Student
1. Find student with "Inactive" status
2. Click 🔄 (toggle icon)
3. Confirm activation
4. Status changes to "Approved"
5. Student regains access

### Delete a Student
1. Find student to delete
2. Click 🗑️ (trash icon)
3. Confirm deletion (⚠️ Cannot be undone!)
4. Student removed from system

---

## 🔍 Search & Filter

### Search Students
**Search by:**
- Name
- Email
- Institution
- Phone number
- Roll number

**How to:**
1. Type in search box
2. Results filter automatically
3. Clear search to see all

### Filter by Status
1. Click status dropdown
2. Select:
   - All Status (default)
   - Pending
   - Approved
   - Rejected
   - Inactive
3. List updates instantly

### Refresh List
Click "🔄 Refresh" button to reload latest data

---

## 📋 Typical Workflow

### Daily Approval Routine

**Morning Check:**
```
1. Login to admin panel
2. Go to Student Management
3. Check "Pending Approval" count
4. If > 0, you have work to do!
```

**Review Each Pending Student:**
```
1. Click 👁️ to view details
2. Check:
   ✓ Valid name
   ✓ Valid email
   ✓ Valid phone number
   ✓ Real institution
   ✓ Appropriate department
3. Make decision:
   → Approve if everything looks good ✅
   → Reject if suspicious or incomplete ❌
```

**After Approval:**
```
- Student receives access immediately
- Can check status and start exams
- Moves to "Approved" list
```

---

## 🚨 Important Notes

### Security
- ⚠️ Only approve legitimate students
- ⚠️ Verify institution names
- ⚠️ Check for duplicate registrations
- ⚠️ Suspicious emails? Reject!

### Best Practices
- ✅ Review pending students daily
- ✅ Respond within 24-48 hours
- ✅ Keep "Pending" list at 0
- ✅ Use search to find specific students
- ✅ Deactivate instead of delete (if unsure)

### What NOT to Do
- ❌ Don't approve without reviewing
- ❌ Don't delete active students (deactivate instead)
- ❌ Don't reject without reason
- ❌ Don't ignore pending approvals

---

## 🎓 Student Journey (Your Role)

```
Student Registers
      ↓
Shows in "Pending" (🟡)
      ↓
[YOUR ACTION NEEDED] ← Review profile
      ↓
You click Approve ✅ or Reject ❌
      ↓
Approved: Student gets full access 🎉
Rejected: Student sees rejection message ❌
```

---

## 💡 Pro Tips

1. **Quick Approval:**
   - Use search to find specific student
   - Click approve directly from list
   - No need to open details modal

2. **Bulk Review:**
   - Filter by "Pending"
   - Open each in new tab
   - Approve all at once

3. **Managing Active Students:**
   - Use "Inactive" instead of "Delete"
   - Can always reactivate later
   - Delete only for spam/duplicates

4. **Finding Students:**
   - Search by partial name
   - Search by institution
   - Use filters to narrow down

5. **Status Check:**
   - Green badge = good to go
   - Yellow badge = needs your attention
   - Red badge = denied access
   - Gray badge = temporarily disabled

---

## 📊 Understanding the Numbers

**Dashboard Statistics:**

```
Total Students: 50
├── Pending: 5      → Need your approval
├── Approved: 40    → Active students
├── Rejected: 3     → Denied access
└── Inactive: 2     → Temporarily disabled
```

**What to Monitor:**
- High "Pending" count = approval backlog
- Growing "Approved" count = more active students
- High "Rejected" = strict approval policy
- "Inactive" count = temporarily disabled students

---

## 🆘 Common Questions

**Q: How long should approvals take?**
A: Aim for 24-48 hours max

**Q: What if I approve by mistake?**
A: Click toggle to deactivate, or reject if needed

**Q: Can students see why they're rejected?**
A: They see generic rejection message (no specific reason shown)

**Q: What happens when I approve a student?**
A: They get immediate access to dashboard and all exams

**Q: Can students re-apply if rejected?**
A: They can register with different email

**Q: Should I delete or deactivate?**
A: Deactivate (can undo), Delete only for spam/duplicates

---

## ⚡ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refresh list | Ctrl + R / Cmd + R |
| Focus search | Ctrl + F / Cmd + F |
| Close modal | Esc |

---

## 📱 Mobile Access

Admin panel works on mobile:
- All features available
- Touch-friendly buttons
- Responsive design
- Same functionality

---

## 🔗 Quick Links

- **Admin Dashboard:** `/admin`
- **Student Management:** `/admin/students`
- **Test Management:** `/admin/tests`
- **Analytics:** `/admin/analytics`

---

## 📞 Need Help?

**Technical Issues:**
- Check browser console for errors
- Try refreshing the page
- Clear browser cache
- Contact system administrator

**Student Questions:**
- Students should contact support
- You focus on approvals
- Don't share admin access

---

## ✅ Daily Checklist

```
☐ Login to admin panel
☐ Check "Pending Approval" count
☐ Review all pending students
☐ Approve legitimate registrations
☐ Reject suspicious applications
☐ Respond to any student issues
☐ Keep pending list at 0
```

---

## 🎯 Success Metrics

**Good Admin Practice:**
- ✅ Pending approvals < 5
- ✅ Response time < 48 hours
- ✅ Approval rate 80-90%
- ✅ Zero spam students approved

**Warning Signs:**
- ⚠️ Pending approvals > 10
- ⚠️ Response time > 72 hours
- ⚠️ All students approved (no review)
- ⚠️ Duplicate students

---

Remember: You're the gatekeeper! Only approve legitimate students to maintain the quality and integrity of the IELTS practice platform. 🎓✨
