# Angular Build Performance Report

**Project:** to-do-app  
**Framework:** Angular 19.2.0  
**Measurement Date:** 2025-08-25 18:21:55  
**Runs:** 3

## Build Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | 5739 |
| Minimum | 5464 |
| Maximum | 6028 |

### Individual Build Times
- Run 1: 6028ms - Run 2: 5723ms - Run 3: 5464ms

## Dev Server Startup Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | 9735 |
| Minimum | 8192 |
| Maximum | 12800 |

### Individual Dev Startup Times
- Run 1: 12800ms - Run 2: 8192ms - Run 3: 8213ms

## Success Rate
- Build: 3/3 (100%)
- Dev Server: 3/3 (100%)
## Configuration
- **Build Command:** \
pm run build\ (ng build)
- **Dev Command:** \
pm run start\ (ng serve)
- **Port:** 4200
- **Max Dev Startup Wait:** 120 seconds

## Notes
- Angular CLI build with production optimizations
- Dev server measured until port 4200 responds or success indicators detected
- Times measured from process start to completion/readiness
- Cleanup performed between runs (dist folder removal)
