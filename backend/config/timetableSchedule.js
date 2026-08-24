const PERIOD_SCHEDULE = [
  { period: 1, startTime: "08:00", endTime: "08:45" },
  { period: 2, startTime: "08:45", endTime: "09:30" },
  { period: 3, startTime: "09:30", endTime: "10:15" },
  { period: 4, startTime: "10:15", endTime: "11:00" },
  { period: 5, startTime: "11:30", endTime: "12:15" },
  { period: 6, startTime: "12:15", endTime: "13:00" },
  { period: 7, startTime: "13:00", endTime: "13:45" },
  { period: 8, startTime: "13:45", endTime: "14:30" },
];

const LUNCH_BREAK = { label: "Lunch break", startTime: "11:00", endTime: "11:30" };

module.exports = { PERIOD_SCHEDULE, LUNCH_BREAK };
