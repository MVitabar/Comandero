"use client"

import { useState, useRef } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, subDays, subMonths } from "date-fns"
import { Download, FileSpreadsheet, Calendar, Table } from "lucide-react"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { 
  ExcelReportGeneratorProps, 
  ExcelReportTableProps 
} from "@/types"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export function ExcelReportGenerator({ reportData }: ExcelReportGeneratorProps) {
  const { t } = useI18n()
  const reportRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("sales")
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("monthly")

  // Date range state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Handle Excel export
  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()

    if (reportData.sales) {
      const salesWs = XLSX.utils.json_to_sheet([reportData.sales])
      XLSX.utils.book_append_sheet(wb, salesWs, t("sales"))
    }

    if (reportData.orders) {
      const ordersWs = XLSX.utils.json_to_sheet(reportData.orders)
      XLSX.utils.book_append_sheet(wb, ordersWs, t("orders"))
    }

    if (reportData.inventory) {
      const inventoryWs = XLSX.utils.json_to_sheet(reportData.inventory)
      XLSX.utils.book_append_sheet(wb, inventoryWs, t("inventory"))
    }

    if (reportData.financial) {
      const financialWs = XLSX.utils.json_to_sheet(reportData.financial)
      XLSX.utils.book_append_sheet(wb, financialWs, t("financial"))
    }

    if (reportData.staff) {
      const staffWs = XLSX.utils.json_to_sheet(reportData.staff)
      XLSX.utils.book_append_sheet(wb, staffWs, t("staff"))
    }

    if (reportData.customers) {
      const customersWs = XLSX.utils.json_to_sheet(reportData.customers)
      XLSX.utils.book_append_sheet(wb, customersWs, t("customers"))
    }

    if (reportData.reservations) {
      const reservationsWs = XLSX.utils.json_to_sheet(reportData.reservations)
      XLSX.utils.book_append_sheet(wb, reservationsWs, t("reservations"))
    }

    // Export the workbook
    XLSX.writeFile(wb, `Restaurant_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
  }

  // Handle PDF export
  const handlePdfExport = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(t("restaurantReport"), 14, 22)

    // Add date range
    doc.setFontSize(12)
    doc.text(
      `${t("period")}: ${date?.from ? format(date.from, "dd/MM/yyyy") : ""} - ${date?.to ? format(date.to, "dd/MM/yyyy") : ""}`,
      14,
      32,
    )

    // Add tables for each section
    let yPos = 40

    // Sales section
    if (reportData.sales) {
      doc.setFontSize(14)
      doc.text(t("sales"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.sales)],
        body: [reportData.sales],
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Orders section
    if (reportData.orders && reportData.orders.length > 0) {
      doc.setFontSize(14)
      doc.text(t("orders"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.orders[0])],
        body: reportData.orders,
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Inventory section
    if (reportData.inventory && reportData.inventory.length > 0) {
      doc.setFontSize(14)
      doc.text(t("inventory"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.inventory[0])],
        body: reportData.inventory,
        theme: "grid",
        headStyles: { fillColor: [241, 196, 15], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Financial section
    if (reportData.financial && reportData.financial.length > 0) {
      doc.setFontSize(14)
      doc.text(t("financial"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.financial[0])],
        body: reportData.financial,
        theme: "grid",
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Staff section
    if (reportData.staff && reportData.staff.length > 0) {
      doc.setFontSize(14)
      doc.text(t("staff"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.staff[0])],
        body: reportData.staff,
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Customers section
    if (reportData.customers && reportData.customers.length > 0) {
      doc.setFontSize(14)
      doc.text(t("customers"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.customers[0])],
        body: reportData.customers,
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        styles: { fontSize: 10 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Reservations section
    if (reportData.reservations && reportData.reservations.length > 0) {
      doc.setFontSize(14)
      doc.text(t("reservations"), 14, yPos)
      yPos += 10

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [Object.keys(reportData.reservations[0])],
        body: reportData.reservations,
        theme: "grid",
        headStyles: { fillColor: [241, 196, 15], textColor: 255 },
        styles: { fontSize: 10 },
      })
    }

    // Save the PDF
    doc.save(`Restaurant_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`)
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
          <Button variant="outline" onClick={handleExcelExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t("exportExcel")}
          </Button>
          <Button variant="outline" onClick={handlePdfExport}>
            <Download className="mr-2 h-4 w-4" />
            {t("exportPdf")}
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

        <div ref={reportRef} className="p-4 bg-white rounded-lg shadow">
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

function ExcelReportTable({ title, data, headerColor }: ExcelReportTableProps) {
  const { t } = useI18n()

  // Handle case when data is undefined
  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-4">
        {t("noDataAvailable")}
      </div>
    )
  }

  // Dynamic summary generation function
  const generateSummary = (data: any) => {
    // Handle SalesData specifically
    if (data && 'totalRevenue' in data) {
      return [
        { label: t("totalRevenue"), value: data.totalRevenue },
        { label: t("averageOrderValue"), value: data.averageOrderValue },
        { label: t("numberOfOrders"), value: data.numberOfOrders }
      ]
    }

    // Generic summary generation for other data types
    return Object.entries(data || {})
      .filter(([_, value]) => 
        typeof value === 'number' || 
        typeof value === 'string'
      )
      .slice(0, 4)
      .map(([key, value]) => ({
        label: t(key),
        value: value
      }))
  }

  // Dynamic charts generation function
  const generateCharts = (data: any) => {
    // Handle SalesData specifically
    if (data && 'totalRevenue' in data) {
      return [
        {
          title: t("salesDistribution"),
          type: 'pie',
          data: {
            totalRevenue: data.totalRevenue,
            averageOrderValue: data.averageOrderValue,
            numberOfOrders: data.numberOfOrders
          }
        }
      ]
    }

    // Handle array of data
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: `${(item as any).category 
          || (item as any).name 
          || (item as any).status 
          || 'Item'} Analysis`,
        type: 'bar',
        data: { 
          amount: (item as any).amount, 
          percentage: (item as any).percentage,
          performance: (item as any).performance,
          visits: (item as any).visits,
          guests: (item as any).guests,
          status: (item as any).status
        }
      }))
    }

    // Generic chart generation for other data types
    return Object.entries(data || {})
      .filter(([_, value]) => typeof value === 'number')
      .slice(0, 2)
      .map(([key, value]) => ({
        title: `${t(key)} Analysis`,
        type: 'bar',
        data: { [key]: value }
      }))
  }

  // Transform data to a consistent structure
  const transformedData = {
    summary: Array.isArray(data) 
      ? data.map(item => ({
          label: (item as any).category 
            || (item as any).name 
            || (item as any).role 
            || (item as any).status 
            || 'Category',
          value: (item as any).amount 
            || (item as any).performance 
            || (item as any).visits 
            || (item as any).totalSpent 
            || (item as any).guests 
            || 0
        }))
      : generateSummary(data) || [],
    data: Array.isArray(data) 
      ? data 
      : (data.data || [data].filter(Boolean)),
    charts: Array.isArray(data) 
      ? data.map(item => ({
          title: `${(item as any).category 
            || (item as any).name 
            || (item as any).status 
            || 'Item'} Analysis`,
          type: 'bar',
          data: { 
            amount: (item as any).amount, 
            percentage: (item as any).percentage,
            performance: (item as any).performance,
            visits: (item as any).visits,
            guests: (item as any).guests,
            status: (item as any).status
          }
        }))
      : generateCharts(data) || []
  }

  return (
    <div className="space-y-4">
      <div 
        className="p-4 rounded-t-lg"
        style={{ backgroundColor: headerColor }}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {transformedData.summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {transformedData.summary.map((item, index) => (
            <div 
              key={index} 
              className="bg-muted p-3 rounded-lg text-center"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {transformedData.data.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(transformedData.data[0] || {}).map((key) => (
                  <TableHead key={key}>{t(key)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedData.data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.values(row).map((value, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {value instanceof Date 
                        ? format(value, "dd/MM/yyyy") 
                        : String(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {transformedData.charts && transformedData.charts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {transformedData.charts.map((chart, index) => (
            <div key={index} className="bg-muted p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-2">{chart.title}</h4>
              {/* Placeholder for chart rendering logic */}
              <p>Chart type: {chart.type}</p>
              <p>Data: {JSON.stringify(chart.data)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
