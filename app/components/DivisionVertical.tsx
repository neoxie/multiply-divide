export default function DivisionVertical({
  dividend,
  divisor,
  quotient,
}: {
  dividend: number;
  divisor: number;
  quotient: number;
}) {
  return <div>DivisionVertical: {dividend} ÷ {divisor} = {quotient}</div>;
}
