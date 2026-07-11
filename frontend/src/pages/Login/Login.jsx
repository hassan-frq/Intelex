import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Input from "../../components/common/Input/Input";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <Card>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Intelex</h1>
        </div>

        <form className="space-y-5 py-2">
          <div>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Input            
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;