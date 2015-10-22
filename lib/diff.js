
module.exports = function (swig) {

  function normals (lines, start, end) {
    var slice = lines.slice(start, end),
      allNormal = true,
      results = [];

    // make sure the last three were 'normal' lines.
    slice.forEach(function (line) {
      if (line.type === 'add' || line.type === 'del') {
        allNormal = false;
      }
    });

    if (allNormal) {
      slice.forEach(function (line) {
        results.push({ type: line.type, fromLine: line.ln1, toLine: line.ln2, content: line.content });
      });
    }

    return results;
  }

  swig.diff = function diff (gitDiff) {

    var fs = require('fs'),
      path = require('path'),
      parse = require('parse-diff'),
      result = {
        additions: 0,
        deletions: 0,
        files: [],
        fileCount: 0,
      },

      files = parse(gitDiff);

    result.fileCount = files.length;

    files.forEach(function (file) {

      var fileResults = {
          name: file.to,
          fromName: file.from === '/dev/null' ? file.to : file.from,
          additions: file.additions,
          deletions: file.deletions,
          lines: []
        },
        line,
        prev,
        next;

      file.chunks.forEach(function (chunk) {
        fileResults.lines.push({ type: 'chunk', fromLine: null, toLine: null, content: chunk.content });

        for (var i = 0; i < chunk.changes.length; i++) {
            line = chunk.changes[i];
            prev = [];
            next = [];

          if (line.type === 'add' || line.type === 'del') {

            prev = normals(chunk.changes, Math.max(i - 3, 0), i);
            fileResults.lines = fileResults.lines.concat(prev);

            fileResults.lines.push(
              line.type === 'add' ?
                { type: line.type, fromLine: null, toLine: line.ln, content: line.content } :
                { type: line.type, fromLine: line.ln, toLine: null, content: line.content }
            );

            next = normals(chunk.changes, i + 1, i + 4);
            fileResults.lines = fileResults.lines.concat(next);
          }

          if (line.type === 'chunk') {
            fileResults.lines.push({ type: line.type, fromLine: null, toLine: null, content: line.content });
          }
        }
      });

      result.additions += file.additions;
      result.deletions += file.deletions;

      result.files.push(fileResults);
    });

    return result;
  };
};
