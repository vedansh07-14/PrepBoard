export const UNITS_DATA = [
  {
    id: "unit-1",
    title: "Unit I: Basic Counting Principles & Combinatorics",
    topics: [
      { id: "t1-1", title: "Basic Counting Principles" },
      { id: "t1-2", title: "Permutations" },
      { id: "t1-3", title: "Combinations" }
    ]
  },
  {
    id: "unit-2",
    title: "Unit II: Probability Basics & Bayes' Theorem",
    topics: [
      { id: "t2-1", title: "Sample Space & Random Experiments" },
      { id: "t2-2", title: "Basic Probability" },
      { id: "t2-3", title: "Conditional Probability" },
      { id: "t2-4", title: "Bayes’ Theorem" },
      { id: "t2-5", title: "Independence of Events" },
      { id: "t2-6", title: "Types of Events" }
    ]
  },
  {
    id: "unit-3",
    title: "Unit III: Random Variables & Expectations",
    topics: [
      { id: "t3-1", title: "Types of Random Variables" },
      { id: "t3-2", title: "PMF, PDF, CDF" },
      { id: "t3-3", title: "Expectation" },
      { id: "t3-4", title: "Variance" }
    ]
  },
  {
    id: "unit-4",
    title: "Unit IV: Discrete Distributions",
    topics: [
      { id: "t4-1", title: "Discrete Distributions (Uniform, Bernoulli, Binomial, Poisson, Geometric)" },
      { id: "t4-2", title: "Multiple Discrete Random Variables" },
      { id: "t4-3", title: "Mean & Variance" }
    ]
  },
  {
    id: "unit-5",
    title: "Unit V: Continuous Distributions",
    topics: [
      { id: "t5-1", title: "Continuous Distributions (Uniform, Exponential, Normal, Standard Normal)" },
      { id: "t5-2", title: "Mean & Variance" }
    ]
  },
  {
    id: "unit-6",
    title: "Unit VI: Descriptive Statistics",
    topics: [
      { id: "t6-1", title: "Central Tendency" },
      { id: "t6-2", title: "Variability" },
      { id: "t6-3", title: "Skewness" },
      { id: "t6-4", title: "Box Plot" },
      { id: "t6-5", title: "Quartiles & IQR" },
      { id: "t6-6", title: "Sampling" },
      { id: "t6-7", title: "Correlation & Covariance" }
    ]
  },
  {
    id: "unit-7",
    title: "Unit VII: Inferential Statistics",
    topics: [
      { id: "t7-1", title: "Law of Large Numbers" },
      { id: "t7-2", title: "Central Limit Theorem" },
      { id: "t7-3", title: "Point Estimation" },
      { id: "t7-4", title: "Unbiased Estimator" },
      { id: "t7-5", title: "Bias-Variance Tradeoff" },
      { id: "t7-6", title: "Maximum Likelihood Estimation" }
    ]
  }
];

export const calculateProgress = (completedTopics) => {
  const totalTopics = UNITS_DATA.reduce((acc, unit) => acc + unit.topics.length, 0);
  const completedCount = completedTopics.length;
  return totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);
};

export const calculateUnitProgress = (unitId, completedTopics) => {
  const unit = UNITS_DATA.find(u => u.id === unitId);
  if (!unit) return 0;
  
  const unitTopicIds = unit.topics.map(t => t.id);
  const completedInUnit = completedTopics.filter(id => unitTopicIds.includes(id));
  
  return unit.topics.length === 0 ? 0 : Math.round((completedInUnit.length / unit.topics.length) * 100);
};
