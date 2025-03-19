"use client";

import { sendMail } from "@/server/sendMail";
import { EmailSchema } from "@/validation";
import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelParser = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Please upload a valid Excel file (.xlsx or .xls).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setError("The file does not contain any sheets.");
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
        setData(parsedData);
        setError(null);
      } catch (err) {
        setError(
          "Failed to parse the file. Please ensure it is a valid Excel file."
        );
        console.error("Error parsing file:", err);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file.");
    };

    reader.readAsBinaryString(file);
  };

  const handleSend =  () => {
    data?.map(async i => {
    const validatedFields = EmailSchema.safeParse({email: i['Контакт Приемной']});

    if (!validatedFields.success) 
        console.log('skip:', validatedFields?.error?.formErrors?.fieldErrors, i);
    else 
        await sendMail(i['Контакт Приемной'], i['Компания']);
    })         
  }

  return (
    <div className="flex flex-col gap-[20px] p-[20px]">
      <div className="flex flex-col gap-[6px]">
        <h2 className="text-[16px] font-medium text-[#2c2c2c]">
          Upload Excel File
        </h2>

        <div className="flex flex-row gap-[24px]">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="w-fit p-[6px] cursor-pointer border-[#2c2c2c] border-[1px] rounded-[6px]"
            onChange={handleFileUpload}
          />

          <button
            disabled={data?.length === 0}
            className={`w-fit py-[6px] text-[#fff] px-[24px] leading-[18px] rounded-[6px] ${data?.length === 0 ? "bg-[#8f8f8f]" : "bg-[#2c2c2c] cursor-pointer"}`}
            onClick={handleSend}
          >
            send
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="flex flex-col gap-[6px]">
        <h2 className="text-[16px] font-medium text-[#2c2c2c]">Parsed Data:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ExcelParser;
