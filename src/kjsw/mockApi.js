// 模拟子任务数据
const mockSubTasks = new Map();
mockSubTasks.set('4', [  // key对应待实施子任务状态的事务key
  {
    key: '1',
    taskName: '准备系统环境',
    taskManager: '张三',
    taskCollaborators: ['李四', '王五'],
    status: '进行中',
    deadline: '2025-04-15',
    createTime: '2025-04-09 10:00:00'
  },
  {
    key: '2',
    taskName: '数据备份',
    taskManager: '李四',
    taskCollaborators: ['张三'],
    status: '未开始',
    deadline: '2025-04-18',
    createTime: '2025-04-09 11:30:00'
  }
]);

// 模拟事务数据
const mockAffairs = [
  {
    key: '1',
    name: '项目申报材料准备',
    manager: '张三',
    department: '研发部',
    category: '项目申报',
    deadline: '2025-05-01',
    status: '待提交',
    creator: '李四',
    createTime: '2025-04-09 12:00:00'
  },
  {
    key: '2', 
    name: '季度工作总结',
    manager: '王五',
    department: '行政部',
    category: '部门事务',
    deadline: '2025-04-15',
    status: '待总监审核',
    creator: '赵六',
    createTime: '2025-04-08 09:30:00'
  },
  {
    key: '3',
    name: '技术方案评审',
    manager: '李七',
    department: '研发部',
    category: '日常工作',
    deadline: '2025-04-20',
    status: '进行中',
    creator: '王八',
    createTime: '2025-04-07 14:20:00'
  },
  {
    key: '4',
    name: '系统升级计划',
    manager: '赵九',
    department: '研发部',
    category: '日常工作',
    deadline: '2025-04-25',
    status: '待实施子任务',
    creator: '钱十',
    createTime: '2025-04-06 16:45:00'
  }
];

// 模拟方案数据
const mockPlans = new Map();
mockPlans.set('2', [  // key对应待总监审核状态的事务key
  {
    key: '1',
    planName: '实施方案初稿',
    planManager: '张三',
    submitTime: '2025-04-09 10:00:00'
  },
  {
    key: '2',
    planName: '实施方案修订版',
    planManager: '李四',
    submitTime: '2025-04-09 15:30:00'
  }
]);

// 模拟 API 请求
export const mockApi = {
  // 获取事务列表
  getAffairsList: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockAffairs,
          message: '获取成功'
        });
      }, 500);
    });
  },

  // 创建新事务
  createAffair: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockAffairs.push({
          ...data,
          key: String(mockAffairs.length + 1),
          creator: '当前用户',
          createTime: new Date().toLocaleString(),
          status: '待提交'
        });
        resolve({
          code: 200,
          data: null,
          message: '创建成功'
        });
      }, 500);
    });
  },

  // 更新事务状态
  updateAffairStatus: (key, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockAffairs.findIndex(item => item.key === key);
        if (index !== -1) {
          mockAffairs[index].status = status;
        }
        resolve({
          code: 200,
          data: null,
          message: '更新成功'
        });
      }, 500);
    });
  },

  // 获取实施方案列表
  getPlansList: (affairKey) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockPlans.get(affairKey) || [],
          message: '获取成功'
        });
      }, 500);
    });
  },

  // 创建实施方案
  createPlan: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plans = mockPlans.get(data.affairKey) || [];
        const newPlan = {
          ...data,
          key: String(plans.length + 1),
          submitTime: new Date().toLocaleString()
        };
        mockPlans.set(data.affairKey, [...plans, newPlan]);
        resolve({
          code: 200,
          data: null,
          message: '创建成功'
        });
      }, 500);
    });
  },

  // 更新实施方案
  updatePlan: (key, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { affairKey, ...planData } = data;
        const plans = mockPlans.get(affairKey) || [];
        const index = plans.findIndex(item => item.key === key);
        if (index !== -1) {
          plans[index] = { ...plans[index], ...planData };
          mockPlans.set(affairKey, plans);
        }
        resolve({
          code: 200,
          data: null,
          message: '更新成功'
        });
      }, 500);
    });
  },

  // 删除实施方案
  deletePlan: (affairKey, planKey) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plans = mockPlans.get(affairKey) || [];
        const filteredPlans = plans.filter(item => item.key !== planKey);
        mockPlans.set(affairKey, filteredPlans);
        resolve({
          code: 200,
          data: null,
          message: '删除成功'
        });
      }, 500);
    });
  },

  // 获取子任务列表
  getSubTasksList: (affairKey) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockSubTasks.get(affairKey) || [],
          message: '获取成功'
        });
      }, 500);
    });
  },

  // 创建子任务
  createSubTask: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = mockSubTasks.get(data.affairKey) || [];
        const newTask = {
          ...data,
          key: String(tasks.length + 1),
          createTime: new Date().toLocaleString()
        };
        mockSubTasks.set(data.affairKey, [...tasks, newTask]);
        resolve({
          code: 200,
          data: null,
          message: '创建成功'
        });
      }, 500);
    });
  },

  // 更新子任务
  updateSubTask: (affairKey, taskKey, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = mockSubTasks.get(affairKey) || [];
        const index = tasks.findIndex(item => item.key === taskKey);
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...data };
          mockSubTasks.set(affairKey, tasks);
        }
        resolve({
          code: 200,
          data: null,
          message: '更新成功'
        });
      }, 500);
    });
  },

  // 删除子任务
  deleteSubTask: (affairKey, taskKey) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = mockSubTasks.get(affairKey) || [];
        const filteredTasks = tasks.filter(item => item.key !== taskKey);
        mockSubTasks.set(affairKey, filteredTasks);
        resolve({
          code: 200,
          data: null,
          message: '删除成功'
        });
      }, 500);
    });
  }
};
