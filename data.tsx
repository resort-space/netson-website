const models = [
  { id: "modela", modelName: "Model A" },
  { id: "modelb", modelName: "Model B" },
  { id: "modelc", modelName: "Model C" },
];

const testItems = [
  { id: "test1", name: "Test Item 1" },
  { id: "test2", name: "Test Item 2" },
  { id: "test3", name: "Test Item 3" },
  { id: "test4", name: "Test Item 4" },
  { id: "test5", name: "Test Item 5" },
];

const conditions = {
  failOnly: "Fail Only",
  all: "All",
};

const getSubscriptions = {
  user: "User Subscription",
  mySubscription: [
    {
      modelId: "modela",
      tests: [
        {
          testId: "test1",
          failOnly: true,
          all: false,
        },
        {
          testId: "test2",
          failOnly: true,
          all: true,
        },
      ],
    },
    {
      modelId: "modelb",
      tests: [
        {
          testId: "test1",
          failOnly: true,
          all: false,
        },
        {
          testId: "test4",
          failOnly: false,
          all: true,
        },
      ],
    },
  ],
};

const postSubscriptions = {
  mySubscription: [
    {
      modelId: "modela",
      tests: [
        {
          testId: "test1",
          failOnly: true,
          fail: false,
        },
        {
          testId: "test2",
          failOnly: true,
          fail: true,
        },
      ],
    },
    {
      modelId: "modelb",
      tests: [
        {
          testId: "test1",
          failOnly: true,
          fail: false,
        },
        {
          testId: "test4",
          failOnly: false,
          fail: true,
        },
      ],
    },
  ],
};
