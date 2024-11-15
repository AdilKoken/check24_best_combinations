import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PackageComparisonProps, ComparisonResult } from "../types";

function PackageComparison({
  selectedTeams,
}: PackageComparisonProps): JSX.Element {
  const {
    data: packages,
    isLoading,
    error,
  } = useQuery<ComparisonResult>({
    queryKey: ["packages", selectedTeams.map((t) => t.id)],
    queryFn: async () => {
      const response = await axios.get<ComparisonResult>(
        `${process.env.REACT_APP_API_URL}/api/packages/compare`,
        {
          params: {
            teamIds: selectedTeams.map((t) => t.id).join(","),
          },
        }
      );
      return response.data;
    },
    enabled: selectedTeams.length > 0,
  });

  if (isLoading)
    return <div className="text-center py-4">Calculating best packages...</div>;
  if (error)
    return <div className="text-red-600 py-4">Error comparing packages</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Package Comparison</h2>

      {packages?.singlePackage && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Best Single Package</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-medium text-green-800">
              {packages.singlePackage.name}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Covers {packages.singlePackage.coverage}% of matches
            </p>
            <p className="text-sm text-green-700">
              Price: ${packages.singlePackage.price}/month
            </p>
          </div>
        </div>
      )}

      {packages?.combinations && packages.combinations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Best Package Combinations
          </h3>
          <div className="space-y-4">
            {packages.combinations.map((combo, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Combination {index + 1}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Coverage: {combo.coverage}%
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    ${combo.totalPrice}/month
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {combo.packages.map((pkg) => (
                      <span
                        key={pkg.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {pkg.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {packages?.coverage && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Coverage Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packages.coverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="coverage"
                  fill="#3B82F6"
                  name="Match Coverage %"
                />
                <Bar dataKey="price" fill="#10B981" name="Monthly Price ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageComparison;
