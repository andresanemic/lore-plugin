# Always-on material growth threshold

The 2.4.5 guard uses an 8,192-byte absolute increase as the point where accepting a new always-on baseline requires user authority.

## Verified series

| Before | After | Delta | Classification |
| ---: | ---: | ---: | --- |
| 77,973 | 81,090 | +3,117 | legitimate |
| 81,090 | 86,528 | +5,438 | largest legitimate increase observed |
| 86,528 | 91,608 | +5,080 | legitimate |
| 91,608 | 93,031 | +1,423 | legitimate |
| 93,031 | 93,300 | +269 | legitimate |
| 28,418 | 29,855 | +1,437 | legitimate |
| 29,855 | 68,608 | +38,753 | authority required |

8,192 is the first complete binary boundary above the largest legitimate increase observed, 5,438 bytes. It is a conservative authority boundary, not a diagnosis of crowding or a claim that smaller growth is harmless.
