import React, { useState, useRef, RefObject, MouseEvent } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, subDays, subMonths } from "date-fns"
import { Download, Printer, FileSpreadsheet, Calendar } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import type { Options } from "react-to-print"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { AllReportData } from "@/app/advanced-reports/page"

interface ExcelReportGeneratorProps {
  reportData: AllReportData
  fileName?: string
  onExport?: () => void
  printRef?: React.RefObject<HTMLDivElement | null>
}

export function ExcelReportGenerator({ 
  reportData, 
  fileName, 
  onExport, 
  printRef 
}: ExcelReportGeneratorProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("sales")
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("monthly")
  
  // Date range state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Updated print button handler to use correct type
  const handlePrintButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    handlePrint()
  }

  // Handle print functionality
  const handlePrint = useReactToPrint({
    bodyClass: 'print-report',
    documentTitle: fileName || `Restaurant_Report_${format(new Date(), "yyyy-MM-dd")}`,
    onBeforePrint: async () => {
      // Optional: Add any pre-print logic
      try {
        // Simulate any async preparation if needed
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error before print:', error)
      }
    },
    onAfterPrint: async () => {
      // Optional: Add any post-print logic
      try {
        // Simulate any async cleanup or logging
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error after print:', error)
      }
    },
    content: () => printRef?.current || null,
  } as Options)

  // Handle Excel export
  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()

    // Safely handle each report section
    const exportReportSection = (sectionName: keyof AllReportData, sheetName: string) => {
      const section = reportData[sectionName]
      if (section?.data && section.data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(section.data)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      }
    }

    // Export each report section
    exportReportSection('sales', t("sales"))
    exportReportSection('orders', t("orders"))
    exportReportSection('inventory', t("inventory"))
    exportReportSection('financial', t("financial"))
    exportReportSection('staff', t("staff"))
    exportReportSection('customers', t("customers"))
    exportReportSection('reservations', t("reservations"))

    // Export the workbook
    XLSX.writeFile(wb, fileName ? `${fileName}.xlsx` : `Restaurant_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
  }

  // Handle PDF export
  const handlePdfExport = () => {
    const doc = new jsPDF()
    let yPos = 20

    // Helper function to safely export a report section
    const exportPdfSection = (
      sectionName: keyof AllReportData, 
      sectionTitle: string
    ) => {
      const section = reportData[sectionName]
      
      // Check if section and data exist
      if (!section?.data || section.data.length === 0) {
        return
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add section title
      doc.setFontSize(14)
      doc.text(sectionTitle, 14, yPos)
      yPos += 10

      // Safely get table headers and rows
      const headers = section.data.length > 0 
        ? [Object.keys(section.data[0])] 
        : []
      const rows = section.data.map(Object.values)

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: headers,
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        styles: { fontSize: 10 },
      })

      // Update y position after table
      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Export each report section
    exportPdfSection('sales', t("sales"))
    exportPdfSection('orders', t("orders"))
    exportPdfSection('inventory', t("inventory"))
    exportPdfSection('financial', t("financial"))
    exportPdfSection('staff', t("staff"))
    exportPdfSection('customers', t("customers"))
    exportPdfSection('reservations', t("reservations"))

    // Save the PDF
    doc.save(fileName ? `${fileName}.pdf` : `Restaurant_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  // Update date range based on period selection
  const handlePeriodChange = (period: "daily" | "weekly" | "monthly" | "yearly" | "custom") => {
    setReportPeriod(period)

    const today = new Date()
    let fromDate: Date

    switch (period) {
      case "daily":
        fromDate = today
        break
      case "weekly":
        fromDate = subDays(today, 7)
        break
      case "monthly":
        fromDate = subMonths(today, 1)
        break
      case "yearly":
        fromDate = new Date(today.getFullYear(), 0, 1)
        break
      case "custom":
        // Don't change the date range for custom
        return
      default:
        fromDate = subDays(today, 30)
    }

    setDate({
      from: fromDate,
      to: today,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{t("generateReport")}</h2>

        <div className="flex flex-wrap gap-2">
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handlePdfExport}
          >
            <Download className="mr-2 h-4 w-4" /> 
            {t("export Pdf")}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("period")}:</span>
          </div>

          <div className="grid grid-cols-2 md:flex gap-2">
            <Button
              variant={reportPeriod === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("daily")}
            >
              {t("daily")}
            </Button>
            <Button
              variant={reportPeriod === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("weekly")}
            >
              {t("weekly")}
            </Button>
            <Button
              variant={reportPeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("monthly")}
            >
              {t("monthly")}
            </Button>
            <Button
              variant={reportPeriod === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("yearly")}
            >
              {t("yearly")}
            </Button>
            <Button
              variant={reportPeriod === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("custom")}
            >
              {t("custom")}
            </Button>
          </div>

          <div className="w-full md:w-auto">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="sales">{t("sales")}</TabsTrigger>
          <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("inventory")}</TabsTrigger>
          <TabsTrigger value="financial">{t("financial")}</TabsTrigger>
          <TabsTrigger value="staff">{t("staff")}</TabsTrigger>
          <TabsTrigger value="customers">{t("customers")}</TabsTrigger>
          <TabsTrigger value="reservations">{t("reservations")}</TabsTrigger>
        </TabsList>

        <div ref={printRef} className="p-4 bg-white rounded-lg shadow">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{t("restaurantReport")}</h1>
            <p className="text-muted-foreground">
              {date?.from && date?.to
                ? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
                : t("allTime")}
            </p>
          </div>

          <TabsContent value="sales" className="mt-0">
            <ExcelReportTable title={t("salesAndBilling")} data={reportData.sales} headerColor="#3498db" />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <ExcelReportTable title={t("orderManagement")} data={reportData.orders} headerColor="#2ecc71" />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <ExcelReportTable title={t("inventoryControl")} data={reportData.inventory} headerColor="#e74c3c" />
          </TabsContent>

          <TabsContent value="financial" className="mt-0">
            <ExcelReportTable title={t("financialInformation")} data={reportData.financial} headerColor="#f39c12" />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <ExcelReportTable title={t("staffPerformance")} data={reportData.staff} headerColor="#9b59b6" />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <ExcelReportTable title={t("customersAndMarketing")} data={reportData.customers} headerColor="#1abc9c" />
          </TabsContent>

          <TabsContent value="reservations" className="mt-0">
            <ExcelReportTable
              title={t("reservationsAndOccupancy")}
              data={reportData.reservations}
              headerColor="#34495e"
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

interface ExcelReportTableProps {
  title: string
  data: {
    summary: { label: string; value: string | number }[]
    data: any[]
    charts?: { title: string; type: string; data: any }[]
  }
  headerColor: string
}

function ExcelReportTable({ title, data, headerColor }: ExcelReportTableProps) {
  const { t } = useI18n()

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">{t("noDataAvailable")}</div>
  }

  return (
    <div className="space-y-6 excel-report">
      <div className="text-xl font-bold pb-2 border-b-2" style={{ borderColor: headerColor }}>
        {title}
      </div>

      {/* Summary section */}
      {data.summary && data.summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.summary.map((item, index) => (
            <div key={index} className="border rounded p-3" style={{ borderLeft: `4px solid ${headerColor}` }}>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Data table */}
      {data.data && data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: headerColor }}>
                {Object.keys(data.data[0]).map((key) => (
                  <th key={key} className="border border-gray-300 px-4 py-2 text-white text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  {Object.values(row).map((value: any, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No data message */}
      {(!data.data || data.data.length === 0) && (
        <div className="text-center py-4 text-muted-foreground border rounded p-4">{t("noDetailedDataAvailable")}</div>
      )}
    </div>
  )
}
