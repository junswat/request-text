import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            チャット解析アプリ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ログインして利用を開始してください
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={signInWithGoogle}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  )
} 