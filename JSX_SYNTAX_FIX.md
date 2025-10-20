# JSX Syntax Error Fix

## Problem

```
ERROR in ./src/components/admin/SubmissionManagement.jsx
SyntaxError: Unexpected token (258:60)

> 258 |  <p className="text-sm text-gray-600">Failed (<60%)</p>
      |                                                      ^
```

## Root Cause

In JSX, the `<` character is interpreted as the start of a JSX tag/element. When used in text content like `(<60%)`, the parser gets confused and throws a syntax error.

## Solution

Replace `<` with the HTML entity `&lt;` in JSX text content.

### Before (Error):
```jsx
<p className="text-sm text-gray-600">Failed (<60%)</p>
<option value="failed">Failed (<60%)</option>
```

### After (Fixed):
```jsx
<p className="text-sm text-gray-600">Failed (&lt;60%)</p>
<option value="failed">Failed (&lt;60%)</option>
```

## Alternative Solutions

You could also use:

1. **Curly braces with string:**
```jsx
<p>Failed ({'<'}60%)</p>
```

2. **Template literal:**
```jsx
<p>Failed {`(<60%)`}</p>
```

3. **Unicode escape:**
```jsx
<p>Failed (\u003C60%)</p>
```

However, `&lt;` is the most semantic and readable approach.

## Files Fixed

- `/app/frontend/src/components/admin/SubmissionManagement.jsx`
  - Line 258: Statistics card text
  - Line 328: Filter dropdown option

## Common HTML Entities in JSX

When writing text in JSX, remember to escape these characters:

| Character | HTML Entity | Description |
|-----------|-------------|-------------|
| `<` | `&lt;` | Less than |
| `>` | `&gt;` | Greater than |
| `&` | `&amp;` | Ampersand |
| `"` | `&quot;` | Double quote |
| `'` | `&apos;` or `&#39;` | Single quote |
| ` ` | `&nbsp;` | Non-breaking space |

## Result

✅ Frontend compiled successfully
✅ No more syntax errors
✅ Text displays correctly as "Failed (<60%)"

---

**Status:** Fixed and verified working
