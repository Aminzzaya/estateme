"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  Select,
  message,
  Spin,
  ConfigProvider,
  Table,
  Tooltip,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PencilIcon, LaptopIcon } from "@/components/Icons";
import Nav from "@/components/Nav";

export default function Dashboard() {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [createform] = Form.useForm();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [status, setStatus] = useState("Идэвхтэй");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    form.setFieldsValue(selectedEmployee);
  }, [selectedEmployee]);

  const getUsers = async () => {
    try {
      const response = await fetch("/api/getUsers");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
        const maxEmployeeId = findMaxEmployeeId(data.employees);
        const nextEmployeeId = getNextEmployeeId(maxEmployeeId);
        setEmployeeId(nextEmployeeId);
      } else {
        console.error("Алдаа: Хэрэглэгчийн мэдээлэл FE:", response.statusText);
      }
    } catch (error) {
      console.error("Алдаа: Хэрэглэгчийн мэдээлэл BE:", error);
    } finally {
      setLoading(false);
    }
  };

  const findMaxEmployeeId = (employees) => {
    const numericIds = employees.map((employee) => {
      return parseInt(employee.employeeId.replace(/[^\d]/g, ""), 10);
    });
    return Math.max(...numericIds);
  };

  const getNextEmployeeId = (maxEmployeeId) => {
    const nextId = maxEmployeeId + 1;
    return `E${nextId.toString().padStart(3, "0")}`;
  };

  const onProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setProfilePreview(reader.result);
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async ({ formValues }) => {
    setLoadingBtn(true);
    try {
      let pictureUrl = profilePreview;

      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        formData.append("upload_preset", "ml_default");

        const cloudinaryResponse = await fetch(
          "https://api.cloudinary.com/v1_1/estateme/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          console.error("Failed to upload image to Cloudinary");
          return;
        }

        const cloudinaryData = await cloudinaryResponse.json();
        console.log("Cloudinary Data:", cloudinaryData);
        pictureUrl = cloudinaryData.secure_url;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          password: formValues.password,
          lastName: formValues.lastName,
          firstName: formValues.firstName,
          email: formValues.email,
          phoneNumber: formValues.phoneNumber,
          employeeType: formValues.employeeType,
          status,
          profilePicture: pictureUrl,
        }),
      });

      if (response.ok) {
        message.success("Амжилттай бүртгэлээ.");
        setRegisterModalOpen(false);
        getUsers();
      } else {
        console.error("Алдаа: Хэрэглэгчийн мэдээлэл FE:", response.statusText);
      }
    } catch (error) {
      console.error("Алдаа: Хэрэглэгчийн мэдээлэл BE:", error);
    } finally {
      setLoadingBtn(false);
      createform.resetFields();
      setProfilePreview(null);
    }
  };

  const handleEdit = (employee) => {
    setEditModalOpen(true);
    setSelectedEmployee(employee);
  };

  const handleEditSubmit = async ({ formValues }) => {
    setLoadingBtn(true);
    try {
      if (isNaN(formValues.employeeTypeName)) {
        formValues.employeeTypeName = selectedEmployee.employeeType;
      }
      const response = await fetch("/api/updateUserStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: selectedEmployee.employeeId,
          email: formValues.email,
          phoneNumber: formValues.phoneNumber,
          employeeType: formValues.employeeTypeName,
          status: formValues.status,
        }),
      });

      if (response.ok) {
        message.success("Амжилттай шинэчлэгдлээ.");
        setEditModalOpen(false);
        getUsers();
      } else {
        console.error("Алдаа: Хэрэглэгчийн мэдээлэл FE:", response.statusText);
      }
    } catch (error) {
      console.error("Алдаа: Хэрэглэгчийн мэдээлэл BE:", error);
    } finally {
      setLoadingBtn(false);
    }
  };

  return (
    <>
      {loading ? (
        <ConfigProvider
          theme={{
            token: {
              colorBgMask: "transparent",
            },
          }}
        >
          <Spin
            fullscreen
            wrapperClassName="spin"
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 24,
                }}
                spin
              />
            }
          />
        </ConfigProvider>
      ) : (
        <main className="px-12 py-8">
          <div className="pt-6 pb-4 flex justify-between">
            <p className="font-semibold text-[15px] text-[#008cc7]">
              АЖИЛЧДЫН ЖАГСААЛТ
            </p>
            <Nav />
          </div>
          <div>
            <div>
              <Button
                className="border-[#008cc7] text-[#008cc7]"
                onClick={() => setRegisterModalOpen(true)}
              >
                + Ажилтан бүртгэх
              </Button>
            </div>
          </div>
          <div className="pt-6"></div>
          <div className="pb-1">
            <Table
              dataSource={employees}
              rowKey="employeeId"
              pagination={false}
            >
              <Table.Column
                title="Нэр, овог"
                dataIndex="firstName"
                key="firstName"
                render={(text, record) => (
                  <div className="flex items-center">
                    <img
                      src={record.profilePicture || "/images/profile.png"}
                      alt="Agent"
                      className="profile w-9 h-9"
                    />
                    <p className="pl-4">
                      {record.firstName} {record.lastName.slice(0, 1)}.
                    </p>
                  </div>
                )}
              />
              <Table.Column
                title="Албан тушаал"
                dataIndex="employeeTypeName"
                key="employeeTypeName"
              />
              <Table.Column
                title="Цахим шуудан"
                dataIndex="email"
                key="email"
                align="center"
              />
              <Table.Column
                title="Утасны дугаар"
                dataIndex="phoneNumber"
                key="phoneNumber"
                align="center"
              />
              <Table.Column
                title="Төлөв"
                dataIndex="status"
                key="status"
                align="center"
                render={(text, record) => (
                  <p
                    className={`p-1 px-3 rounded-lg text-center ${
                      record.status === "Идэвхтэй"
                        ? "bg-[#008cc7] text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {record.status}
                  </p>
                )}
              />
              <Table.Column
                title=""
                dataIndex=""
                key="action"
                align="center"
                render={(text, record) => (
                  <Tooltip title="Засварлах">
                    <Button
                      className="text-[#008cc7]"
                      type="link"
                      onClick={() => {
                        handleEdit(record);
                      }}
                    >
                      <PencilIcon />
                    </Button>
                  </Tooltip>
                )}
              />
            </Table>
          </div>
          <Modal
            title="Ажилтны бүртгэл"
            open={registerModalOpen}
            onCancel={() => setRegisterModalOpen(false)}
            cancelText="Буцах"
            okText="Хадгалах"
            okButtonProps={{
              style: { backgroundColor: "green" },
              loading: loadingBtn,
            }}
            onOk={() =>
              handleSubmit({ formValues: createform.getFieldsValue() })
            }
          >
            <div className="flex justify-center">
              <div className="border rounded-full w-28 h-28">
                <img src={profilePreview} className="profile w-28 h-28"></img>
              </div>
            </div>
            <div className="bg-gray-100 p-2 mx-16 mt-3 rounded-lg">
              <input type="file" accept="image/*" onChange={onProfileChange} />
            </div>

            <div className="flex justify-center pt-4">
              <p>
                Үүсгэсэн ажилтны код:{" "}
                <span className="font-semibold">{employeeId}</span>
              </p>
            </div>

            <Form
              form={createform}
              className="pt-4"
              layout={"vertical"}
              autoComplete="off"
            >
              <div className="flex flex-wrap">
                <div className="w-1/2 px-2">
                  <Form.Item
                    label="Овог"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: "Утга оруулна уу!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="w-1/2 px-2">
                  <Form.Item
                    label="Нэр"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: "Утга оруулна уу!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full px-2">
                  <Form.Item
                    label="Цахим шуудан"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Утга оруулна уу!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="w-full px-2">
                  <Form.Item
                    label="Утасны дугаар"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Утга оруулна уу!",
                      },
                    ]}
                  >
                    <Input maxLength={8} />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full px-2">
                  <Form.Item
                    label="Албан тушаал"
                    name="employeeType"
                    rules={[
                      {
                        required: true,
                        message: "Сонголт хийнэ үү!",
                      },
                    ]}
                  >
                    <Select placeholder="Сонгох">
                      <Option value="1">Хэлтсийн захирал</Option>
                      <Option value="2">Менежер</Option>
                      <Option value="3">Агент</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="w-full px-2">
                  <Form.Item
                    label="Нууц үг"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Утга оруулна уу!",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Нууц үг" />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </Modal>
          {selectedEmployee && (
            <Modal
              title="Мэдээлэл засах"
              open={editModalOpen}
              onCancel={() => setEditModalOpen(false)}
              cancelText="Буцах"
              okText="Хадгалах"
              okButtonProps={{
                style: { backgroundColor: "green" },
                loading: loadingBtn,
              }}
              onOk={() =>
                handleEditSubmit({ formValues: form.getFieldsValue() })
              }
            >
              <div className="flex justify-center">
                <div className="border rounded-full w-28 h-28">
                  <img
                    src={
                      selectedEmployee.profilePicture || "/images/profile.png"
                    }
                    className="profile w-28 h-28"
                  ></img>
                </div>
              </div>
              <p className="text-center pt-4">
                <span className="font-semibold">
                  {selectedEmployee.firstName}
                </span>{" "}
                {selectedEmployee.lastName}
              </p>
              <div className="flex justify-center items-center gap-2">
                <div className="pt-2 text-[#008cc7]">
                  <LaptopIcon />
                </div>

                <p className="mt-2 text-center px-2 rounded-lg py-1 bg-[#008cc7] text-white">
                  {selectedEmployee.employeeTypeName}
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <p>
                  Ажилтны код:{" "}
                  <span className="font-semibold">
                    {selectedEmployee.employeeId}
                  </span>
                </p>
              </div>

              <Form
                form={form}
                className="pt-4"
                layout={"vertical"}
                autoComplete="off"
                initialValues={selectedEmployee}
              >
                <div className="flex flex-wrap">
                  <div className="w-full px-2">
                    <Form.Item label="Цахим шуудан" name="email">
                      <Input />
                    </Form.Item>
                  </div>
                  <div className="w-full px-2">
                    <Form.Item label="Утасны дугаар" name="phoneNumber">
                      <Input />
                    </Form.Item>
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="w-full px-2">
                    <Form.Item label="Албан тушаал" name="employeeTypeName">
                      <Select placeholder="Сонгох">
                        <Option value="1">Хэлтсийн захирал</Option>
                        <Option value="2">Менежер</Option>
                        <Option value="3">Агент</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="w-full px-2">
                    <Form.Item label="Төлөв" name="status">
                      <Select>
                        <Option value="Идэвхтэй">Идэвхтэй</Option>
                        <Option value="Идэвхгүй">Идэвхгүй</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </Modal>
          )}
        </main>
      )}
    </>
  );
}
