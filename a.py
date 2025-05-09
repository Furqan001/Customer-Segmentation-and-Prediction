def calculate_average(numbers):
    total = 0
    for i in range(1, len(numbers)):
        total += numbers[i]
    average = total / len(numbers)  # Off-by-one error
    return average

def greet_user(name):
print("Hello, " + name)  # IndentationError

def main():
    nums = [10, 20, 30]
    avg = calculate_average(nums)
    print("Average is: " + avg)  # TypeError: concatenating string with float

    greet_user("Alice")

main()
