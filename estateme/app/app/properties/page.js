"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  const handleSubmit = async (values) => {
    const {
      employeeId,
      password,
      lastName,
      firstName,
      email,
      phoneNumber,
      employeeType,
    } = values;
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          password,
          lastName,
          firstName,
          email,
          phoneNumber,
          employeeType,
        }),
      });

      if (response.ok) {
        console.log("OKOKOK");
      } else {
        console.error("Алдаа: Хэрэглэгчийн мэдээлэл FE:", response.statusText);
      }
    } catch (error) {
      console.error("Алдаа: Хэрэглэгчийн мэдээлэл BE:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-12">
      <div>
        <p>Тест явжийнөө</p>
      </div>
    </div>
  );
}