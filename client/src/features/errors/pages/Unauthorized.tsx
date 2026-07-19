import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from 'shared/components';
import { ShieldOff } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <EmptyState
        icon={<ShieldOff className="text-alert-red" size={48} />}
        title="Unauthorized"
        description="You do not have permission to access this resource."
        action={
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Go to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
