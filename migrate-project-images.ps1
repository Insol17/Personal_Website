$root = Join-Path $PSScriptRoot "assets\images\projects"

$projects = @(
  "benedict",
  "salgut",
  "fernand",
  "deco",
  "machinator"
)

foreach ($project in $projects) {
  $projectFolder = Join-Path $root $project
  $overviewFolder = Join-Path $projectFolder "overview"
  $screenshotsFolder = Join-Path $projectFolder "screenshots"

  New-Item -ItemType Directory -Force -Path $projectFolder | Out-Null
  New-Item -ItemType Directory -Force -Path $overviewFolder | Out-Null
  New-Item -ItemType Directory -Force -Path $screenshotsFolder | Out-Null

  $oldCover = Join-Path $root "$project.jpg"
  $newCover = Join-Path $projectFolder "cover.jpg"

  if ((Test-Path $oldCover) -and !(Test-Path $newCover)) {
    Move-Item $oldCover $newCover
  }

  for ($i = 1; $i -le 10; $i++) {
    $number = "{0:D2}" -f $i

    $oldOverview = Join-Path $root "details\$project-detail-$number.jpg"
    $newOverview = Join-Path $overviewFolder "$number.jpg"

    if ((Test-Path $oldOverview) -and !(Test-Path $newOverview)) {
      Move-Item $oldOverview $newOverview
    }

    $oldScreenshot = Join-Path $root "screenshots\$project-$number.jpg"
    $newScreenshot = Join-Path $screenshotsFolder "$number.jpg"

    if ((Test-Path $oldScreenshot) -and !(Test-Path $newScreenshot)) {
      Move-Item $oldScreenshot $newScreenshot
    }
  }
}

Write-Host "프로젝트 이미지 이동 완료"
