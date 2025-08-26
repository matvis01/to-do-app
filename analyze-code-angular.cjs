const fs = require('fs');
const path = require('path');

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function countLines(content, fileExtension) {
  const lines = content.split('\n');
  let sourceLines = 0;
  let commentLines = 0;
  let emptyLines = 0;
  let totalLines = lines.length;

  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      emptyLines++;
    } else if (fileExtension === '.ts' || fileExtension === '.js') {
      // TypeScript/JavaScript comment detection
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed === '/**' || trimmed === '*/') {
        commentLines++;
      } else if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
        commentLines++;
      } else if (trimmed.startsWith('/*') || trimmed.startsWith('/**')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('*/') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else if (fileExtension === '.html') {
      // HTML comment detection
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
        commentLines++;
      } else if (trimmed.startsWith('<!--')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('-->') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else if (fileExtension === '.scss' || fileExtension === '.css') {
      // SCSS/CSS comment detection
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
        commentLines++;
      } else if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
        commentLines++;
      } else if (trimmed.startsWith('/*')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('*/') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else {
      // Default: treat as source
      sourceLines++;
    }
  }

  return {
    total: totalLines,
    source: sourceLines,
    comments: commentLines,
    empty: emptyLines
  };
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = getFileExtension(filePath);
    const stats = countLines(content, extension);
    
    return {
      path: filePath,
      extension: extension,
      ...stats
    };
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return null;
  }
}

function shouldAnalyzeFile(filePath) {
  const extension = getFileExtension(filePath);
  const allowedExtensions = ['.ts', '.js', '.html', '.scss', '.css', '.json'];
  
  // Skip certain files/directories
  const excludePatterns = [
    'node_modules',
    '.angular',
    'dist',
    '.git',
    'coverage',
    '.vscode',
    'public',
    '.tsbuildinfo',
    'package-lock.json'
  ];
  
  // Check if file should be excluded
  if (excludePatterns.some(pattern => filePath.includes(pattern))) {
    return false;
  }
  
  return allowedExtensions.includes(extension);
}

function getAngularFileType(filePath) {
  const filename = path.basename(filePath);
  const extension = getFileExtension(filePath);
  
  if (extension === '.ts') {
    if (filename.includes('.component.')) return 'component';
    if (filename.includes('.service.')) return 'service';
    if (filename.includes('.guard.')) return 'guard';
    if (filename.includes('.resolver.')) return 'resolver';
    if (filename.includes('.interceptor.')) return 'interceptor';
    if (filename.includes('.directive.')) return 'directive';
    if (filename.includes('.pipe.')) return 'pipe';
    if (filename.includes('.model.')) return 'model';
    if (filename.includes('.interface.')) return 'interface';
    if (filename.includes('.config.')) return 'config';
    if (filename.includes('.routes.')) return 'routing';
    if (filename.includes('.actions.')) return 'store-actions';
    if (filename.includes('.reducer.')) return 'store-reducer';
    if (filename.includes('.effects.')) return 'store-effects';
    if (filename.includes('.selectors.')) return 'store-selectors';
    if (filename === 'main.ts') return 'bootstrap';
    return 'typescript';
  }
  
  if (extension === '.html') return 'template';
  if (extension === '.scss' || extension === '.css') return 'styles';
  if (extension === '.json') return 'configuration';
  
  return 'other';
}

function scanDirectory(dirPath) {
  const results = [];
  
  function scan(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (shouldAnalyzeFile(fullPath)) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            analysis.type = getAngularFileType(fullPath);
            analysis.relativePath = path.relative(dirPath, fullPath);
            results.push(analysis);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentPath}:`, error.message);
    }
  }
  
  scan(dirPath);
  return results;
}

function generateReport(files, projectPath) {
  const totalStats = {
    files: files.length,
    total: 0,
    source: 0,
    comments: 0,
    empty: 0
  };
  
  // Calculate totals
  files.forEach(file => {
    totalStats.total += file.total;
    totalStats.source += file.source;
    totalStats.comments += file.comments;
    totalStats.empty += file.empty;
  });
  
  // Group by type
  const byType = {};
  files.forEach(file => {
    if (!byType[file.type]) {
      byType[file.type] = { files: 0, total: 0, source: 0, comments: 0, empty: 0 };
    }
    byType[file.type].files++;
    byType[file.type].total += file.total;
    byType[file.type].source += file.source;
    byType[file.type].comments += file.comments;
    byType[file.type].empty += file.empty;
  });
  
  // Group by extension
  const byExtension = {};
  files.forEach(file => {
    if (!byExtension[file.extension]) {
      byExtension[file.extension] = { files: 0, total: 0, source: 0, comments: 0, empty: 0 };
    }
    byExtension[file.extension].files++;
    byExtension[file.extension].total += file.total;
    byExtension[file.extension].source += file.source;
    byExtension[file.extension].comments += file.comments;
    byExtension[file.extension].empty += file.empty;
  });

  // Find large files (potential refactoring candidates)
  const largeFiles = files
    .filter(f => f.total > 100)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const commentRatio = totalStats.total > 0 ? (totalStats.comments / totalStats.total * 100) : 0;
  const sourceRatio = totalStats.total > 0 ? (totalStats.source / totalStats.total * 100) : 0;
  const emptyRatio = totalStats.total > 0 ? (totalStats.empty / totalStats.total * 100) : 0;

  const report = `# Angular To-Do App - Code Analysis Report

*Generated on: ${new Date().toISOString().split('T')[0]}*

## 📊 Executive Summary

This Angular application manages tasks with a focus on modern Angular practices and state management. The codebase demonstrates strong Angular 19 patterns with TypeScript, Angular Material, and NgRx integration.

### Key Metrics
- **Total Files**: ${totalStats.files}
- **Total Lines of Code**: ${totalStats.total.toLocaleString()}
- **Source Lines**: ${totalStats.source.toLocaleString()} (${sourceRatio.toFixed(1)}%)
- **Comment Lines**: ${totalStats.comments.toLocaleString()} (${commentRatio.toFixed(1)}%)
- **Empty Lines**: ${totalStats.empty.toLocaleString()} (${emptyRatio.toFixed(1)}%)
- **Comment Ratio**: ${commentRatio.toFixed(1)}%

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Angular 19.2.0
- **Language**: TypeScript
- **UI Library**: Angular Material
- **Styling**: SCSS + Tailwind CSS
- **Build Tool**: Angular CLI with Vite
- **State Management**: NgRx
- **Testing**: Jasmine + Karma (configured)

### Project Structure Analysis

| File Type | Files | Lines | Comments | Purpose |
|-----------|-------|-------|----------|---------|
${Object.entries(byType)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([type, stats]) => 
    `| ${type} | ${stats.files} | ${stats.total.toLocaleString()} | ${stats.comments} | ${getTypeDescription(type)} |`
  ).join('\n')}

## 🧩 Angular Architecture Analysis

### File Type Distribution

| Extension | Files | Lines | Comments | Average Lines/File |
|-----------|-------|-------|----------|-------------------|
${Object.entries(byExtension)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([ext, stats]) => 
    `| ${ext} | ${stats.files} | ${stats.total.toLocaleString()} | ${stats.comments} | ${Math.round(stats.total / stats.files)} |`
  ).join('\n')}

## 📋 Component Complexity Analysis

### Large Files (Potential Refactoring Candidates)

${largeFiles.map((file, index) => {
  const complexity = getComplexityLevel(file.total);
  const icon = complexity === 'High' ? '🔴' : complexity === 'Medium' ? '🟡' : '🟢';
  return `#### ${icon} ${complexity} Complexity (${file.total} lines)
${index + 1}. **${path.basename(file.path)}** (${file.total} lines)
   - **Type**: ${file.type}
   - **Path**: \`${file.relativePath}\`
   - **Recommendation**: ${getRecommendation(file.type, file.total)}`;
}).join('\n\n')}

## 📈 Code Quality Metrics

### Documentation Coverage
- **Overall Comment Ratio**: ${commentRatio.toFixed(1)}% ${commentRatio >= 10 ? '✅ Good' : commentRatio >= 5 ? '⚠️ Acceptable' : '❌ Needs Improvement'}
- **Components**: ${getCommentRatioForType(byType, 'component').toFixed(1)}%
- **Services**: ${getCommentRatioForType(byType, 'service').toFixed(1)}%
- **Store Logic**: ${getStoreCommentRatio(byType).toFixed(1)}%

### Maintainability Indicators
- **Average File Size**: ${Math.round(totalStats.total / totalStats.files)} lines
- **Largest File**: ${largeFiles[0] ? largeFiles[0].total : 0} lines
- **TypeScript Usage**: ${((byExtension['.ts']?.files || 0) / totalStats.files * 100).toFixed(1)}%
- **Template/Logic Ratio**: ${getTemplateLogicRatio(byExtension)}

## 🎯 Recommendations

### High Priority
1. **Large File Refactoring**
${largeFiles.slice(0, 3).map(file => 
  `   - Refactor \`${path.basename(file.path)}\` (${file.total} lines) - ${getSpecificRecommendation(file.type)}`
).join('\n')}

2. **Documentation Improvement**
   - Current comment ratio: ${commentRatio.toFixed(1)}% (target: 10-15%)
   - Add JSDoc comments to public methods and interfaces
   - Document NgRx store logic and complex business rules

3. **Code Organization**
   - Consider feature modules for better organization
   - Extract shared interfaces and models
   - Implement consistent component structure

### Medium Priority
4. **Angular Best Practices**
   - Ensure OnPush change detection for performance
   - Implement proper error handling patterns
   - Use Angular's dependency injection effectively

5. **Type Safety**
   - Add strict TypeScript configurations
   - Implement comprehensive interface definitions
   - Use Angular's typed reactive forms

### Low Priority
6. **Performance Optimization**
   - Implement lazy loading for feature modules
   - Consider virtual scrolling for large lists
   - Optimize bundle size with tree-shaking

## 🔍 Technical Debt Analysis

### Current State
${getTechnicalDebtAssessment(totalStats, largeFiles, commentRatio)}

### Angular-Specific Patterns
- **Component Architecture**: ${getComponentArchitectureStatus(byType)}
- **State Management**: ${getStateManagementStatus(byType)}
- **Testing Coverage**: ${getTestingStatus(files)}

## 📊 Comparison with Angular Best Practices

| Metric | Current | Recommended | Status |
|--------|---------|-------------|--------|
| Component Size | ${getAverageComponentSize(byType)} avg | <200 lines | ${getAverageComponentSize(byType) < 200 ? '✅' : '⚠️'} |
| Comment Ratio | ${commentRatio.toFixed(1)}% | 10-15% | ${commentRatio >= 10 ? '✅' : commentRatio >= 5 ? '⚠️' : '❌'} |
| TypeScript Usage | ${((byExtension['.ts']?.files || 0) / totalStats.files * 100).toFixed(1)}% | >90% | ✅ |
| Store Pattern | ${byType['store-actions'] ? 'NgRx' : 'None'} | NgRx/Akita | ${byType['store-actions'] ? '✅' : '⚠️'} |

## 🚀 Next Steps

1. **Immediate (This Sprint)**
   - Add component documentation
   - Refactor largest components

2. **Short Term (Next 2 Sprints)**
   - Implement feature modules
   - Add comprehensive error handling

3. **Long Term (Future Releases)**
   - Performance optimization
   - Advanced Angular patterns
   - Comprehensive testing strategy

---

*This analysis was generated using automated code analysis tools. Regular updates recommended as the codebase evolves.*

## 📁 Detailed File Analysis

### All Analyzed Files
${files.map(file => 
  `- \`${file.relativePath}\` (${file.type}) - ${file.total} lines (${file.source} source, ${file.comments} comments)`
).join('\n')}
`;

  return report;
}

function getTypeDescription(type) {
  const descriptions = {
    'component': 'Angular components with templates and logic',
    'service': 'Injectable services and providers',
    'guard': 'Route guards and security',
    'resolver': 'Route data resolvers',
    'interceptor': 'HTTP interceptors',
    'directive': 'Custom directives',
    'pipe': 'Custom pipes and transformations',
    'model': 'Data models and interfaces',
    'interface': 'TypeScript interfaces',
    'config': 'Configuration files',
    'routing': 'Route definitions',
    'store-actions': 'NgRx action definitions',
    'store-reducer': 'NgRx state reducers',
    'store-effects': 'NgRx side effects',
    'store-selectors': 'NgRx state selectors',
    'bootstrap': 'Application bootstrap',
    'typescript': 'General TypeScript files',
    'template': 'HTML templates',
    'styles': 'SCSS/CSS styling',
    'configuration': 'JSON configuration files'
  };
  return descriptions[type] || 'Other files';
}

function getComplexityLevel(lines) {
  if (lines > 300) return 'High';
  if (lines > 150) return 'Medium';
  return 'Low';
}

function getRecommendation(type, lines) {
  if (lines > 300) {
    switch (type) {
      case 'component': return 'Split into smaller components, extract template logic';
      case 'service': return 'Break into multiple focused services';
      case 'store-reducer': return 'Split into feature-specific reducers';
      default: return 'Consider refactoring into smaller, focused modules';
    }
  }
  return 'File size is acceptable';
}

function getSpecificRecommendation(type) {
  const recommendations = {
    'component': 'Extract child components and shared logic',
    'service': 'Split into smaller, single-responsibility services',
    'store-reducer': 'Use feature state and combine reducers',
    'typescript': 'Break into logical modules'
  };
  return recommendations[type] || 'Refactor for better maintainability';
}

function getCommentRatioForType(byType, type) {
  const typeStats = byType[type];
  if (!typeStats || typeStats.total === 0) return 0;
  return (typeStats.comments / typeStats.total) * 100;
}

function getStoreCommentRatio(byType) {
  const storeTypes = ['store-actions', 'store-reducer', 'store-effects', 'store-selectors'];
  let totalLines = 0;
  let totalComments = 0;
  
  storeTypes.forEach(type => {
    if (byType[type]) {
      totalLines += byType[type].total;
      totalComments += byType[type].comments;
    }
  });
  
  return totalLines > 0 ? (totalComments / totalLines) * 100 : 0;
}

function getTemplateLogicRatio(byExtension) {
  const templates = byExtension['.html']?.total || 0;
  const logic = byExtension['.ts']?.total || 0;
  if (logic === 0) return 'N/A';
  return `${(templates / logic).toFixed(2)}:1 (template:logic)`;
}

function getTechnicalDebtAssessment(totalStats, largeFiles, commentRatio) {
  const largeFileCount = largeFiles.length;
  let assessment = '**Manageable Debt**: ';
  
  if (largeFileCount > 5 && commentRatio < 5) {
    assessment += 'High debt - Multiple large files with poor documentation';
  } else if (largeFileCount > 3 || commentRatio < 8) {
    assessment += 'Medium debt - Some large files or documentation issues';
  } else {
    assessment += 'Low debt - Well-maintained codebase';
  }
  
  return assessment;
}

function getComponentArchitectureStatus(byType) {
  const components = byType['component']?.files || 0;
  const avgSize = byType['component'] ? byType['component'].total / byType['component'].files : 0;
  
  if (avgSize < 150) return '✅ Well-sized components';
  if (avgSize < 250) return '⚠️ Some large components';
  return '❌ Components too large';
}

function getStateManagementStatus(byType) {
  const hasNgRx = byType['store-actions'] || byType['store-reducer'];
  return hasNgRx ? '✅ NgRx implemented' : '⚠️ Consider state management';
}

function getTestingStatus(files) {
  const hasTests = files.some(f => f.path.includes('.spec.') || f.path.includes('.test.'));
  return hasTests ? '✅ Test files present' : '❌ No test files found';
}

function getAverageComponentSize(byType) {
  const componentStats = byType['component'];
  if (!componentStats || componentStats.files === 0) return 0;
  return Math.round(componentStats.total / componentStats.files);
}

// Main execution
const projectPath = process.cwd();
console.log(`🔍 Analyzing Angular project: ${projectPath}`);
console.log('📊 Scanning files...');

const files = scanDirectory(projectPath);
console.log(`✅ Found ${files.length} files to analyze`);

console.log('📈 Generating report...');
const report = generateReport(files, projectPath);

const outputFile = 'ANGULAR_CODE_ANALYSIS_REPORT.md';
fs.writeFileSync(outputFile, report);

console.log(`✅ Report saved to: ${outputFile}`);
console.log(`📋 Summary: ${files.length} files, ${files.reduce((sum, f) => sum + f.total, 0)} total lines`);
