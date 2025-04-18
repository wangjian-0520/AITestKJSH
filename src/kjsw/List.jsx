import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Drawer, Descriptions, Tag, Space, message } from 'antd';
import dayjs from 'dayjs';
import { mockApi } from './mockApi';
import './List.less';

const List = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();
  const [planForm] = Form.useForm();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planList, setPlanList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subTaskList, setSubTaskList] = useState([]);
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [subTaskForm] = Form.useForm();
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 获取事务列表
  const fetchAffairs = async () => {
    setLoading(true);
    try {
      const res = await mockApi.getAffairsList();
      if (res.code === 200) {
        setDataSource(res.data);
      }
    } catch (error) {
      messageApi.error('获取数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAffairs();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = async (values) => {
    try {
      const response = await mockApi.createAffair({
        name: values.title,
        manager: values.manager,
        department: values.department,
        category: values.category,
        deadline: values.deadline.format('YYYY-MM-DD'),
      });

      if (response.code === 200) {
        messageApi.success('创建成功');
        fetchAffairs();
        form.resetFields();
        setIsModalOpen(false);
      }
    } catch (error) {
      messageApi.error('创建失败');
    }
  };

  const handleSubmit = async (record) => {
    try {
      const response = await mockApi.updateAffairStatus(record.key, '待总监审核');
      if (response.code === 200) {
        messageApi.success('提交成功');
        await fetchAffairs();
        const updatedRecord = dataSource.find(item => item.key === record.key);
        setCurrentItem(updatedRecord);
      }
    } catch (error) {
      messageApi.error('提交失败');
    }
  };

  const handleDiscard = async (record) => {
    try {
      const response = await mockApi.updateAffairStatus(record.key, '已废弃');
      if (response.code === 200) {
        messageApi.success('已废弃');
        await fetchAffairs();
        const updatedRecord = dataSource.find(item => item.key === record.key);
        setCurrentItem(updatedRecord);
      }
    } catch (error) {
      messageApi.error('操作失败');
    }
  };

  const showDrawer = async (record) => {
    setCurrentItem(record);
    setIsDrawerOpen(true);
    if (record.status === '待实施子任务') {
      try {
        const res = await mockApi.getSubTasksList(record.key);
        if (res.code === 200) {
          setSubTaskList(res.data);
        }
      } catch (error) {
        messageApi.error('获取子任务列表失败');
      }
    } else if (record.status !== '待提交') {
      try {
        const res = await mockApi.getPlansList(record.key);
        if (res.code === 200) {
          setPlanList(res.data);
        }
      } catch (error) {
        messageApi.error('获取方案列表失败');
      }
    }
  };

  // 子任务相关函数
  const showSubTaskModal = (record = null) => {
    if (record) {
      setEditingSubTask(record);
      subTaskForm.setFieldsValue({
        taskName: record.taskName,
        taskManager: record.taskManager,
        taskCollaborators: record.taskCollaborators,
        status: record.status,
        deadline: record.deadline ? dayjs(record.deadline) : undefined
      });
    }
    setIsSubTaskModalOpen(true);
  };

  const handleSubTaskCancel = () => {
    subTaskForm.resetFields();
    setIsSubTaskModalOpen(false);
    setEditingSubTask(null);
  };

  const handleSubTaskSubmit = async (values) => {
    if (!currentItem) return;
    
    try {
      const formattedValues = {
        ...values,
        deadline: values.deadline.format('YYYY-MM-DD'),
        affairKey: currentItem.key
      };

      if (editingSubTask) {
        await mockApi.updateSubTask(currentItem.key, editingSubTask.key, formattedValues);
        messageApi.success('更新成功');
      } else {
        await mockApi.createSubTask(formattedValues);
        messageApi.success('创建成功');
      }
      
      const res = await mockApi.getSubTasksList(currentItem.key);
      if (res.code === 200) {
        setSubTaskList(res.data);
      }
      
      subTaskForm.resetFields();
      setIsSubTaskModalOpen(false);
      setEditingSubTask(null);
    } catch (error) {
      messageApi.error('操作失败');
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentItem(null);
  };

  const showPlanModal = (record = null) => {
    if (record) {
      setEditingPlan(record);
      planForm.setFieldsValue({
        planName: record.planName,
        planManager: record.planManager,
      });
    }
    setIsPlanModalOpen(true);
  };

  const handlePlanCancel = () => {
    planForm.resetFields();
    setIsPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handlePlanSubmit = async (values) => {
    if (!currentItem) return;
    
    try {
      if (editingPlan) {
        await mockApi.updatePlan(editingPlan.key, {
          ...values,
          affairKey: currentItem.key
        });
        messageApi.success('更新成功');
      } else {
        await mockApi.createPlan({
          ...values,
          affairKey: currentItem.key
        });
        messageApi.success('创建成功');
      }
      const res = await mockApi.getPlansList(currentItem.key);
      if (res.code === 200) {
        setPlanList(res.data);
      }
      planForm.resetFields();
      setIsPlanModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      messageApi.error('操作失败');
    }
  };

  // 定义表格列
  const columns = [
    {
      title: '事务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => showDrawer(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    {
      title: '事务负责人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '分类',
      dataIndex: 'category', 
      key: 'category',
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case '待提交':
            color = 'warning';
            break;
          case '待总监审核':
            color = 'cyan';
            break;
          case '进行中':
            color = 'processing';
            break;
          case '已完成':
            color = 'success';
            break;
          case '已废弃':
            color = 'error';
            break;
          case '待实施子任务':
            color = 'magenta';
            break;
          default:
            color = 'default';
        }
        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    }
  ];

  return (
    <>
    {contextHolder}
      <div className="kjsw-list">
        <div className="list-header">
          <h2>科技事务列表</h2>
          <Button type="primary" onClick={showModal}>
            新增
          </Button>
        </div>
        <Table 
          loading={loading}
          dataSource={dataSource} 
          columns={columns} 
          pagination={{ pageSize: 10 }}
        />
      </div>
      <Modal
        title="新建科技事务"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="事务标题"
            name="title"
            rules={[{ required: true, message: '请输入事务标题' }]}
          >
            <Input placeholder="请输入事务标题" />
          </Form.Item>

          <Form.Item
            label="事务负责人"
            name="manager"
            rules={[{ required: true, message: '请输入事务负责人' }]}
          >
            <Input placeholder="请输入事务负责人" />
          </Form.Item>

          <Form.Item
            label="部门"
            name="department"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              <Select.Option value="研发部">研发部</Select.Option>
              <Select.Option value="市场部">市场部</Select.Option>
              <Select.Option value="行政部">行政部</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="截止时间"
            name="deadline"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择截止时间" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Select.Option value="项目申报">项目申报</Select.Option>
              <Select.Option value="部门事务">部门事务</Select.Option>
              <Select.Option value="日常工作">日常工作</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button type="default" onClick={handleCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="事务详情"
        placement="right"
        onClose={closeDrawer}
        open={isDrawerOpen}
        width={800}
        extra={
          (() => {
            if (currentItem?.status === '待提交') {
              return (
                <Space>
                  <Button type="primary" onClick={() => handleSubmit(currentItem)}>提交</Button>
                  <Button danger onClick={() => handleDiscard(currentItem)}>废弃</Button>
                </Space>
              );
            }
            if (currentItem?.status === '待总监审核') {
              return (
                <Space>
                  <Button 
                    type="primary" 
                    onClick={async () => {
                      try {
                        await mockApi.updateAffairStatus(currentItem.key, '待实施子任务');
                        messageApi.success('已通过');
                        await fetchAffairs();
                        const updatedRecord = dataSource.find(item => item.key === currentItem.key);
                        setCurrentItem(updatedRecord);
                      } catch (error) {
                        messageApi.error('操作失败');
                      }
                    }}
                  >
                    通过
                  </Button>
                  <Button 
                    danger 
                    onClick={async () => {
                      try {
                        await mockApi.updateAffairStatus(currentItem.key, '待提交');
                        messageApi.success('已退回');
                        await fetchAffairs();
                        const updatedRecord = dataSource.find(item => item.key === currentItem.key);
                        setCurrentItem(updatedRecord);
                      } catch (error) {
                        messageApi.error('操作失败');
                      }
                    }}
                  >
                    退回
                  </Button>
                </Space>
              );
            }
            if (currentItem?.status === '待实施子任务') {
              return (
                <Space>
                  <Button 
                    type="primary" 
                    onClick={async () => {
                      try {
                        const unfinishedTask = subTaskList.find(task => task.status !== '已完成');
                        if (unfinishedTask) {
                          messageApi.error('存在未完成子任务，请完成子任务实施');
                          return;
                        }
                        await mockApi.updateAffairStatus(currentItem.key, '待验收');
                        messageApi.success('已通过');
                        await fetchAffairs();
                        const updatedRecord = dataSource.find(item => item.key === currentItem.key);
                        setCurrentItem(updatedRecord);
                      } catch (error) {
                        messageApi.error('操作失败');
                      }
                    }}
                  >
                    通过
                  </Button>
                </Space>
              );
            }
            return null;
          })()
        }
      >
        {currentItem && (
          <Descriptions column={1}>
            <Descriptions.Item label="事务名称">{currentItem.name}</Descriptions.Item>
            <Descriptions.Item label="事务负责人">{currentItem.manager}</Descriptions.Item>
            <Descriptions.Item label="部门">{currentItem.department}</Descriptions.Item>
            <Descriptions.Item label="分类">{currentItem.category}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{currentItem.deadline}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                currentItem.status === '待提交' ? 'warning' : 
                currentItem.status === '待总监审核' ? 'cyan' :
                currentItem.status === '进行中' ? 'processing' : 
                currentItem.status === '已完成' ? 'success' :
                currentItem.status === '已废弃' ? 'error' :
                currentItem.status === '待实施子任务' ? 'magenta' : 'default'
              }>
                {currentItem.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{currentItem.creator}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentItem.createTime}</Descriptions.Item>
          </Descriptions>
        )}
        {currentItem?.status !== '待提交' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>实施方案列表</h3>
              {currentItem?.status === '待总监审核' && (
                <Button type="primary" onClick={() => showPlanModal()}>新增方案</Button>
              )}
            </div>
            <Table
              size="small"
              columns={[
                {
                  title: '方案名称',
                  dataIndex: 'planName',
                  key: 'planName',
                },
                {
                  title: '方案负责人',
                  dataIndex: 'planManager',
                  key: 'planManager',
                },
                {
                  title: '提交时间',
                  dataIndex: 'submitTime',
                  key: 'submitTime',
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => showPlanModal(record)}>
                        编辑
                      </Button>
                      <Button 
                        type="link" 
                        size="small" 
                        danger 
                        onClick={async () => {
                          try {
                            await mockApi.deletePlan(currentItem.key, record.key);
                            messageApi.success('删除成功');
                            const res = await mockApi.getPlansList(currentItem.key);
                            if (res.code === 200) {
                              setPlanList(res.data);
                            }
                          } catch (error) {
                            messageApi.error('删除失败');
                          }
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={planList}
              pagination={false}
            />
          </div>
        )}
        {currentItem?.status === '待实施子任务' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>实施子任务列表</h3>
              <Button type="primary" onClick={() => showSubTaskModal()}>新增子任务</Button>
            </div>
            <Table
              size="small"
              columns={[
                {
                  title: '任务名称',
                  dataIndex: 'taskName',
                  key: 'taskName',
                },
                {
                  title: '负责人',
                  dataIndex: 'taskManager',
                  key: 'taskManager',
                },
                {
                  title: '协办人',
                  dataIndex: 'taskCollaborators',
                  key: 'taskCollaborators',
                  render: (collaborators) => collaborators?.join('、')
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === '进行中' ? 'processing' : status === '已完成' ? 'success' : 'default'}>
                      {status}
                    </Tag>
                  )
                },
                {
                  title: '截止时间',
                  dataIndex: 'deadline',
                  key: 'deadline',
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => showSubTaskModal(record)}>
                        编辑
                      </Button>
                      <Button 
                        type="link" 
                        size="small" 
                        danger 
                        onClick={async () => {
                          try {
                            await mockApi.deleteSubTask(currentItem.key, record.key);
                            messageApi.success('删除成功');
                            const res = await mockApi.getSubTasksList(currentItem.key);
                            if (res.code === 200) {
                              setSubTaskList(res.data);
                            }
                          } catch (error) {
                            messageApi.error('删除失败');
                          }
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={subTaskList}
              pagination={false}
            />
          </div>
        )}
      </Drawer>
      <Modal
        title={editingPlan ? "编辑实施方案" : "新建实施方案"}
        open={isPlanModalOpen}
        onCancel={handlePlanCancel}
        footer={null}
        width={500}
      >
        <Form
          form={planForm}
          layout="vertical"
          onFinish={handlePlanSubmit}
        >
          <Form.Item
            label="方案名称"
            name="planName"
            rules={[{ required: true, message: '请输入方案名称' }]}
          >
            <Input placeholder="请输入方案名称" />
          </Form.Item>

          <Form.Item
            label="方案负责人"
            name="planManager"
            rules={[{ required: true, message: '请输入方案负责人' }]}
          >
            <Input placeholder="请输入方案负责人" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button type="default" onClick={handlePlanCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={editingSubTask ? "编辑子任务" : "新建子任务"}
        open={isSubTaskModalOpen}
        onCancel={handleSubTaskCancel}
        footer={null}
        width={500}
      >
        <Form
          form={subTaskForm}
          layout="vertical"
          onFinish={handleSubTaskSubmit}
        >
          <Form.Item
            label="任务名称"
            name="taskName"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            label="负责人"
            name="taskManager"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>

          <Form.Item
            label="协办人"
            name="taskCollaborators"
            rules={[{ required: true, message: '请输入协办人' }]}
          >
            <Select 
              mode="tags" 
              placeholder="请输入协办人（可多选）"
              tokenSeparators={[',']} 
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="未开始">未开始</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="截止时间"
            name="deadline"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button type="default" onClick={handleSubTaskCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default List;
