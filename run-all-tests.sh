#!/bin/bash
# ============================================
#  EMS Project — Full Test Runner
#  Runs backend + frontend tests and prints
#  a combined summary at the end.
# ============================================

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

BACKEND_PASS=0
BACKEND_FAIL=0
BACKEND_DURATION=""
FRONTEND_PASS=0
FRONTEND_FAIL=0
FRONTEND_DURATION=""

# Helper: strip ANSI escape codes
strip_ansi() {
  sed 's/\x1b\[[0-9;]*m//g'
}

echo ""
echo "=========================================="
echo "  EMS Project — Full Test Suite"
echo "=========================================="
echo ""

# ------------------------------------------
#  Backend tests
# ------------------------------------------
echo "▶ Running backend tests..."
echo "------------------------------------------"
npm test > "$TMPDIR/backend.txt" 2>&1
BACKEND_EXIT=$?

grep 'ℹ pass' "$TMPDIR/backend.txt" | tail -1 | sed 's/.*ℹ pass[[:space:]]*//' > "$TMPDIR/bpass.txt" 2>/dev/null
grep 'ℹ fail' "$TMPDIR/backend.txt" | tail -1 | sed 's/.*ℹ fail[[:space:]]*//' > "$TMPDIR/bfail.txt" 2>/dev/null
grep 'ℹ duration_ms' "$TMPDIR/backend.txt" | tail -1 | sed 's/.*ℹ duration_ms[[:space:]]*//' > "$TMPDIR/bdur.txt" 2>/dev/null

[ -s "$TMPDIR/bpass.txt" ] && BACKEND_PASS=$(cat "$TMPDIR/bpass.txt")
[ -s "$TMPDIR/bfail.txt" ] && BACKEND_FAIL=$(cat "$TMPDIR/bfail.txt")
[ -s "$TMPDIR/bdur.txt" ] && BACKEND_DURATION=$(cat "$TMPDIR/bdur.txt")

cat "$TMPDIR/backend.txt"
echo ""

if [ $BACKEND_EXIT -ne 0 ]; then
  echo "  ❌ Backend tests FAILED (exit code $BACKEND_EXIT)"
else
  echo "  ✅ Backend tests PASSED"
fi
echo ""

# ------------------------------------------
#  Frontend tests
# ------------------------------------------
echo "▶ Running frontend tests..."
echo "------------------------------------------"
(cd FrontEnd && npm test -- --run > "$TMPDIR/frontend_raw.txt" 2>&1)
FRONTEND_EXIT=$?

# Strip ANSI codes for parsing
cat "$TMPDIR/frontend_raw.txt" | strip_ansi > "$TMPDIR/frontend.txt"

grep 'Tests' "$TMPDIR/frontend.txt" | grep 'passed' | tail -1 > "$TMPDIR/fline.txt" 2>/dev/null
if [ -s "$TMPDIR/fline.txt" ]; then
  FRONTEND_PASS=$(sed 's/.*[[:space:]]\([0-9][0-9]*\) passed.*/\1/' "$TMPDIR/fline.txt")
  if grep -q 'failed' "$TMPDIR/fline.txt"; then
    FRONTEND_FAIL=$(sed 's/.*[[:space:]]\([0-9][0-9]*\) failed.*/\1/' "$TMPDIR/fline.txt")
  else
    FRONTEND_FAIL=0
  fi
fi

grep 'Duration' "$TMPDIR/frontend.txt" | tail -1 > "$TMPDIR/fdur.txt" 2>/dev/null
if [ -s "$TMPDIR/fdur.txt" ]; then
  FRONTEND_DURATION=$(sed 's/.*Duration[[:space:]]*\([^ (]*\).*/\1/' "$TMPDIR/fdur.txt")
fi

# Print raw output (with colors) for the user
cat "$TMPDIR/frontend_raw.txt"
echo ""

if [ $FRONTEND_EXIT -ne 0 ]; then
  echo "  ❌ Frontend tests FAILED (exit code $FRONTEND_EXIT)"
else
  echo "  ✅ Frontend tests PASSED"
fi
echo ""

# ------------------------------------------
#  Summary
# ------------------------------------------
BACKEND_PASS=${BACKEND_PASS:-0}
BACKEND_FAIL=${BACKEND_FAIL:-0}
FRONTEND_PASS=${FRONTEND_PASS:-0}
FRONTEND_FAIL=${FRONTEND_FAIL:-0}

TOTAL_PASS=$((BACKEND_PASS + FRONTEND_PASS))
TOTAL_FAIL=$((BACKEND_FAIL + FRONTEND_FAIL))

echo "=========================================="
echo "  SUMMARY"
echo "=========================================="
echo ""
echo "  Backend:   ${BACKEND_PASS} passed, ${BACKEND_FAIL} failed (${BACKEND_DURATION:-N/A}ms)"
echo "  Frontend:  ${FRONTEND_PASS} passed, ${FRONTEND_FAIL} failed (${FRONTEND_DURATION:-N/A})"
echo "  ─────────────────────────────────────"
echo "  Total:     ${TOTAL_PASS} passed, ${TOTAL_FAIL} failed"
echo ""

if [ "$TOTAL_FAIL" -eq 0 ] && [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
  echo "  🎉 ALL TESTS PASSED!"
else
  echo "  ⚠️  SOME TESTS FAILED — review the output above."
fi
echo ""
echo "=========================================="

if [ $BACKEND_EXIT -ne 0 ] || [ $FRONTEND_EXIT -ne 0 ]; then
  exit 1
fi
exit 0
