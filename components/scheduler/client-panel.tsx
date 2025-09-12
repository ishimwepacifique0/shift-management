"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Client } from "@/types"

interface ClientPanelProps {
  clients: Client[]
}

export function ClientPanel({ clients }: ClientPanelProps) {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-lg">Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={client.photo || "/placeholder.svg"} />
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.needs.slice(0, 2).map((need) => (
                      <Badge key={need} variant="outline" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                    {client.needs.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.needs.length - 2}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{client.contactInfo.phone}</p>
                </div>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
