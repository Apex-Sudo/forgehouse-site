#!/bin/bash
PASS=0
FAIL=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  echo "=== TEST $i ==="
  RESULT=$(curl -s --max-time 120 -X POST http://localhost:3000/api/mentor-chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Generate a PDF report with a chart and a table. My startup has 500k ARR, 30 customers, 15% monthly growth. Include a bar chart of revenue by quarter and a metrics table. Test run '"$i"'."}],"mentor":"colin-chapman","invite":"test"}')
  if echo "$RESULT" | grep -q '"type":"artifact"'; then
    echo "TEST $i: PASS"
    PASS=$((PASS+1))
  else
    echo "TEST $i: FAIL"
    echo "$RESULT" | tail -c 500
    FAIL=$((FAIL+1))
  fi
  echo ""
done
echo "=== RESULTS: $PASS PASS / $FAIL FAIL out of 10 ==="
