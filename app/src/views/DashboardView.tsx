import { useState, useEffect, type FC } from 'react';
import { AlertCircle, Loader, Trophy } from 'lucide-react';
import { USE_DEMO_MODE } from '../constants';
import StatCard from '../components/StatCard';

interface DashboardViewProps {
  wallet: any;
  connection: any;
}

const DashboardView: FC<DashboardViewProps> = ({ wallet }) => {
  const [myForms, setMyForms] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [checkingPrize, setCheckingPrize] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      setMyForms([
        {
          id: 'my-form-1',
          title: 'My Survey',
          participants: 15,
          prizePool: 0.5,
          status: 'active',
        },
      ]);
      setMySubmissions([
        {
          formTitle: 'Product Feedback',
          submittedAt: Date.now() - 3600000,
          status: 'pending',
          canClaim: true,
        },
      ]);
    }
  }, [wallet.connected]);

  const handleCheckPrize = async (submission: any) => {
    if (!wallet.connected) return;
    
    setCheckingPrize(true);
    
    try {
      if (USE_DEMO_MODE) {
        setTimeout(() => {
          const isWinner = Math.random() > 0.5;
          if (isWinner) {
            alert('🎉 Congratulations! You won 0.05 SOL! Click to claim your prize.');
          } else {
            alert('Sorry, you were not selected as a winner this time. Better luck next time!');
          }
          setCheckingPrize(false);
        }, 2000);
      } else {
        // Production: Call check_and_claim_prize
        // This will automatically check if user is winner and transfer prize
        // const provider = new AnchorProvider(connection, wallet, {});
        // const program = new Program(idl, PROGRAM_ID, provider);
        
        // await program.methods
        //   .checkAndClaimPrize()
        //   .accounts({
        //     form: formPda,
        //     participant: participantPda,
        //     winner: wallet.publicKey,
        //     systemProgram: SystemProgram.programId,
        //   })
        //   .rpc();
        
        alert('Prize claimed successfully!');
        setCheckingPrize(false);
      }
    } catch (error: any) {
      if (error.message.includes('NotAWinner')) {
        alert('You were not selected as a winner this time.');
      } else {
        alert('Error: ' + error.message);
      }
      setCheckingPrize(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-purple-300" />
        <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-purple-200">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-6">My Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Forms Created" value="1" />
          <StatCard title="Forms Completed" value="3" />
          <StatCard title="Total Winnings" value="0.15 SOL" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Forms</h3>
        <div className="space-y-4">
          {myForms.map((form) => (
            <div
              key={form.id}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-semibold">{form.title}</h4>
                  <p className="text-sm text-purple-200">
                    {form.participants} participants
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{form.prizePool} SOL</p>
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                    {form.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Submissions</h3>
        <div className="space-y-4">
          {mySubmissions.map((submission, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-semibold">
                    {submission.formTitle}
                  </h4>
                  <p className="text-sm text-purple-200">
                    Submitted {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-yellow-600 px-3 py-1 rounded-full">
                    {submission.status}
                  </span>
                  {submission.canClaim && (
                    <button
                      onClick={() => handleCheckPrize(submission)}
                      disabled={checkingPrize}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition flex items-center gap-2"
                    >
                      {checkingPrize ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4" />
                          Check Prize
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
