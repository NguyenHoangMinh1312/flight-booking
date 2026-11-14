import { OrderStatus } from "@mint1312-flight-booking/common"
import { RunContext, tool } from "@openai/agents"
import { z } from "zod"

export type AgentCookieContext = {
  cookie?: string
}

export const createSearchOrderTool = (cookie?: string) =>
  tool({
    name: "searchOrders",
    description:
      "Search for the current customer's flight booking orders based on order creation date, order status, page, or limit.",
    parameters: z.object({
      createdDate: z
        .string()
        .optional()
        .describe("Filter orders by creation date in YYYY-MM-DD or ISO 8601 format (e.g., '2026-10-15')"),
      status: z
        .enum(Object.values(OrderStatus))
        .optional()
        .describe("Filter orders by status ('created', 'canceled', 'awaiting-refund', 'complete', or 'refund-failed')"),
      page: z
        .int()
        .positive()
        .optional()
        .describe("Page number for pagination (starts at 1, defaults to 1)"),
      limit: z
        .int()
        .positive()
        .optional()
        .describe("Maximum number of order results to return per page (defaults to 10)"),
    }),
    execute: async (
      { createdDate, status, page, limit },
      runContext?: RunContext<AgentCookieContext>
    ) => {
      try {
        const url = new URL(`${process.env.ORDERS_SRV_URL}/api/orders`)

        if (createdDate)
          url.searchParams.set("createdDate", createdDate)

        if (status)
          url.searchParams.set("status", status)

        if (page !== undefined)
          url.searchParams.set("page", page.toString())

        if (limit !== undefined)
          url.searchParams.set("limit", limit.toString())

        const customerCookie = cookie ?? runContext?.context?.cookie

        const headers: Record<string, string> = {
          Accept: "application/json",
        }

        if (customerCookie) {
          headers.Cookie = customerCookie
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers,
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "")
          return {
            error: `Orders service responded with HTTP ${response.status}: ${errorText || response.statusText
              }`,
          }
        }

        const orders = await response.json()
        return orders
      } catch (err: any) {
        return {
          error: `Failed to query orders service: ${err.message || String(err)
            }`,
        }
      }
    },
  })

export const searchOrderTool = createSearchOrderTool()
