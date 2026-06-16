// Uso: node backend/scripts/generarHash.js
import bcrypt from 'bcryptjs'

const passwords = ['Admin123!', 'Empleado123!']

for (const pwd of passwords) {
  const hash = bcrypt.hashSync(pwd, 10)
  console.log(`${pwd} → ${hash}`)
}
