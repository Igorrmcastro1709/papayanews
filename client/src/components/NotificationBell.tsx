import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, CheckCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: notifications, refetch } = trpc.notifications.list.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Atualizar a cada 30 segundos
    }
  );
  
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000,
    }
  );
  
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (notification.read === 0) {
      markAsRead.mutate({ id: notification.id });
    }
    if (notification.link) {
      setLocation(notification.link);
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2 text-xs"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.read === 0 ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {notification.read === 0 && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {notification.read === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead.mutate({ id: notification.id });
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
