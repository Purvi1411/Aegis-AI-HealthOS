from passlib.context import CryptContext
try:
    c = CryptContext(schemes=['bcrypt'], deprecated='auto')
    print(c.hash('test'))
except Exception as e:
    import traceback
    traceback.print_exc()
