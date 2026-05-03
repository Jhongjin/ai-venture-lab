param(
  [int]$Problem = 0,
  [int]$Frequency = 0,
  [int]$Reachability = 0,
  [int]$WillingnessToPay = 0,
  [int]$MvpSpeed = 0,
  [int]$Differentiation = 0,
  [int]$RegulatoryRisk = 0
)

$ErrorActionPreference = "Stop"

$positive = $Problem + $Frequency + $Reachability + $WillingnessToPay + $MvpSpeed + $Differentiation
$score = $positive - $RegulatoryRisk

if ($score -ge 22) {
  $decision = "promote"
} elseif ($score -ge 15) {
  $decision = "research_more"
} elseif ($score -ge 9) {
  $decision = "pivot"
} else {
  $decision = "kill"
}

[PSCustomObject]@{
  score = $score
  decision = $decision
  max_positive = 30
  risk_penalty = $RegulatoryRisk
} | ConvertTo-Json
