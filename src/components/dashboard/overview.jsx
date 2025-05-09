"use client"

import { useQuery } from "@tanstack/react-query"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { fetcher } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" ,
    },
    title: {
      display: true,
      text: "Monthly Overview",
    },
  },
}

export function Overview() {
  const { data } = useQuery({
    queryKey: ["overview-stats"],
    queryFn: () => fetcher("dashboard/overview"),
  })

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: "Services",
        data: data?.services || [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Complaints",
        data: data?.complaints || [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  }

  return (
    <div className="h-[350px]">
      <Bar options={options} data={chartData} />
    </div>
  )
} 