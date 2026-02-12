import os
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection():
    return psycopg2.connect(DATABASE_URL, sslmode='require')

def process_recurring_expenses():
    """Processes recurring bills and inserts them into the expenses table."""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        today = datetime.now().date()
        print(f"[{datetime.now()}] Starting automation...")

        # Find due recurring expenses
        cur.execute("SELECT id, user_id, title, amount, category, frequency, next_date, note FROM recurring_expenses WHERE next_date <= %s", (today,))
        due_items = cur.fetchall()

        if not due_items:
            print("No due recurring expenses found.")
            return

        for item in due_items:
            id, user_id, title, amount, category, frequency, next_date, note = item
            
            print(f"Processing: {title} ({amount}) for user {user_id}")

            # Insert into expenses
            cur.execute(
                "INSERT INTO expenses (user_id, title, amount, date, category, note) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, title, amount, next_date, category, note or f"Recurring {frequency} bill")
            )

            # Calculate next date
            next_due = calculate_next_date(next_date, frequency)
            
            # Update recurring_expenses
            cur.execute("UPDATE recurring_expenses SET next_date = %s WHERE id = %s", (next_due, id))

        conn.commit()
        print(f"Done! Processed {len(due_items)} items.")

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def calculate_next_date(current_date, frequency):
    if frequency == 'daily':
        return current_date + timedelta(days=1)
    elif frequency == 'weekly':
        return current_date + timedelta(weeks=1)
    elif frequency == 'monthly':
        # Simple month increment
        month = current_date.month % 12 + 1
        year = current_date.year + (current_date.month // 12)
        return current_date.replace(year=year, month=month)
    elif frequency == 'yearly':
        return current_date.replace(year=current_date.year + 1)
    return current_date

if __name__ == "__main__":
    process_recurring_expenses()
