def calculate_average(numbers):
    total = 0
    for i in range(1, len(numbers)):
        total += numbers[i]
    average = total / len(numbers)
    return average

def greet_user(name):
print("Hello, " + name)

def main():
    nums = [10, 20, 30]
    avg = calculate_average(nums)
    print("Average is: " + avg)

    greet_user("Alice")

main()
