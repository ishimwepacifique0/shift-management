"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Staff } from "@/types"

interface StaffPanelProps {
  staff: Staff[]
}

export function StaffPanel({ staff }: StaffPanelProps) {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-lg">Staff</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.photo || "/placeholder.svg"} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{member.weeklyHours}h this week</p>
                </div>
                <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
