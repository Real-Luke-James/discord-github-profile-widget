export function calculateStreak(calendar) {
  if (!calendar || !calendar.weeks) {
    return 0;
  }

  const days = calendar.weeks
    .flatMap(week => week.contributionDays)
    .filter(day => day && day.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (days.length === 0) {
    return 0;
  }

  let streak = 0;
  let startIndex = 0;

  if (days[0].contributionCount === 0) {
    if (days.length > 1 && days[1].contributionCount > 0) {
      startIndex = 1;
    } else {
      return 0;
    }
  }

  for (let i = startIndex; i < days.length; i++) {
    if (days[i].contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function formatStreak(streakCount) {
  if (streakCount === 1) {
    return '1 Day';
  }
  return `${streakCount} Days`;
}
