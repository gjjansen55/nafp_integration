@echo off
del c:\nafp\nafp_adjustments.csv
cscript c:\nafp\scripts\create_credit_memo_file.js %1 %2
IF ERRORLEVEL 1 GOTO NOCOPY
copy c:\nafp\nafp_adjustments.csv "G:\GPShare\IM\NAFP Credit Memo\"
:NOCOPY

