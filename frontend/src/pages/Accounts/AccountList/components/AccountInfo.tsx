import { Account } from "../../../../types/accounts";

interface AccountInfoProps {
  account: Account;
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  account,
  className = "",
}) => {
  return (
    <p className={`text-sm mb-3 ${className}`}>
      <strong>Account:</strong> {account.name} - ({account.code}) -{" "}
      {account.account_number} <br />
      <strong>Current Balance:</strong>{" "}
      {Number(account.balance).toLocaleString()}
    </p>
  );
};

export default AccountInfo;
