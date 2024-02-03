import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useActiveUsers from "@/hooks/use-active-users";

const ActiveUsers = () => {
  // Convert users Map or Object to an array for easier manipulation
  const activeUsersQuery = useActiveUsers();
  const usersArray = activeUsersQuery.data ?? [];
  const displayedUsers = usersArray.slice(0, 3); // Get up to the first three users
  const extraCount = usersArray.length - 3; // Calculate the count of extra users

  return (
    <Sheet>
      <SheetTrigger>
        <div className="flex items-center space-x-reverse space-x-[-14px] px-[20px] cursor-pointer">
          {extraCount > 0 && (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center text-sm">
              +{extraCount}
            </div>
          )}
          {displayedUsers.map((user, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-green-500 rounded-full flex justify-center items-center text-white"
              style={{ zIndex: usersArray.length - index }}
            >
              {user.username.split("")?.[0]?.toUpperCase()}
            </div>
          ))}
        </div>
      </SheetTrigger>
      <SheetContent className="h-full">
        <SheetHeader>
          <SheetTitle>The whole gang.</SheetTitle>
          <SheetDescription>
            Don't be shy, say hi to the whole gang.
          </SheetDescription>
          <div className="overflow-auto max-h-[calc(100vh-6rem)]">
            {usersArray.map((user, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-green-500 rounded-full flex justify-center items-center text-white">
                  {" "}
                  {user.username.split("")?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm">{user.username}</span>
              </div>
            ))}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ActiveUsers;
