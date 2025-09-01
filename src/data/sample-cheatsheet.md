# Python Example

Created by Shimona Carvalho

| datetime.datetime |
| -------- | -------- | -------- | -------- |
| ts = datetime.striptime(timestr, format) | convert string to dt |
| ts.strftime("'%Y%m%d') | convert dt to string |
| format = '%Y-%m-%d %H:%M:%S' | 2024-07-30 14:30:12 |

| collections.deque |
| -------- | -------- | -------- | -------- |
| deque(list, maxlen=None) | create a new double-ended queue |
| append(x) | add item to right end |
| popleft() | remove and return leftmost item |

| String Methods |
| -------- | -------- | -------- | -------- |
| count(sub, start, end) | strip()/lstrip()/rstrip() |
| startswith() / endswith() | encode(encoding) |
| split(sep) | islower() / isupper() |
| join(iterable) | isalpha() |
| replace(old, new, count) | isnumeric() |
| find(sub, start, end) | isdigit() |
| index(sub, start, end) | isalnum() |
| format(*args, **kwargs) | isspace() |
| upper() | capitalize() |
| lower() | title() |

| heapq |
| -------- | -------- | -------- | -------- |
| heappush(heap, item) | push item onto heap |
| heappop(heap) | pop smallest item |
| heapify(x) | transform list into heap in-place |
| heappushpop(heap, item) | push then pop smallest |
| heapreplace(heap, item) | pop smallest then push item |
| nlargest(n, iterable) | return n largest items |
| nsmallest(n, iterable) | return n smallest items |

| list |
| -------- | -------- | -------- | -------- |
| append(x) | extend(iterable) |
| insert(i, x) | remove(x) |
| pop([i]) | clear() |
| index(x) | count(x) |
| sort() | reverse() |
| copy() |
| [:n] | first n items |
| [-n:] | last n items |
| [start:end] | slice from start to end-1 |
| [start:end:step] | slice with step |
| [::-1] | reverse copy |
