import React from 'react';
import { Form, Input, Select, DatePicker, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Create.less';

const Create = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('表单数据:', values);
    // TODO: 处理表单提交
    navigate('/');
  };

  return (
    <div className="kjsw-create">
      <Card title="新建科技事务">
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
            <Button type="default" onClick={() => navigate('/')} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Create;
