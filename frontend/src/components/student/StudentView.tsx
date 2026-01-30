import { useStudentSession } from '../../hooks/useStudentSession';
import { StudentLogin } from './StudentLogin';
import { PollView } from './PollView';

export function StudentView() {
  const { isRegistered } = useStudentSession();

  if (!isRegistered) {
    return <StudentLogin />;
  }

  return <PollView />;
}
